import { ROUTES } from "@/constants/routes";

import {
  ACHIEVEMENT_DEFINITIONS,
  STREAK_MILESTONES,
  syncAchievements,
} from "./achievements";
import { loadGamification, getLevelInfo } from "./gamification";

const STORAGE_KEY = "planitt_learn_notifications";
const MAX_NOTIFICATIONS = 60;

export type NotificationType =
  | "achievement"
  | "level_up"
  | "streak"
  | "lesson_complete"
  | "reminder"
  | "leaderboard"
  | "system";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

export type NotificationFilter = "all" | "unread" | NotificationType;

type PushInput = {
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  dedupeKey?: string;
};

function loadNotifications(userId: string): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    return raw ? (JSON.parse(raw) as Notification[]) : [];
  } catch {
    return [];
  }
}

function saveNotifications(userId: string, list: Notification[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    `${STORAGE_KEY}:${userId}`,
    JSON.stringify(list.slice(0, MAX_NOTIFICATIONS)),
  );
}

export function pushNotification(userId: string, input: PushInput): Notification | null {
  const list = loadNotifications(userId);
  const id = input.dedupeKey ?? `${input.type}:${Date.now()}`;

  if (list.some((n) => n.id === id)) return null;

  const notification: Notification = {
    id,
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href,
    read: false,
    createdAt: new Date().toISOString(),
  };

  saveNotifications(userId, [notification, ...list]);
  return notification;
}

export function getNotifications(userId: string): Notification[] {
  return loadNotifications(userId).sort(
    (a, b) => (b.createdAt > a.createdAt ? 1 : -1),
  );
}

export function getUnreadCount(userId: string): number {
  return loadNotifications(userId).filter((n) => !n.read).length;
}

export function markNotificationRead(userId: string, notificationId: string) {
  const list = loadNotifications(userId);
  const next = list.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  saveNotifications(userId, next);
}

export function markAllNotificationsRead(userId: string) {
  const list = loadNotifications(userId);
  saveNotifications(
    userId,
    list.map((n) => ({ ...n, read: true })),
  );
}

export function markNotificationsReadByType(userId: string, type: NotificationType) {
  const list = loadNotifications(userId);
  saveNotifications(
    userId,
    list.map((n) => (n.type === type && !n.read ? { ...n, read: true } : n)),
  );
}

export function deleteNotification(userId: string, notificationId: string) {
  saveNotifications(
    userId,
    loadNotifications(userId).filter((n) => n.id !== notificationId),
  );
}

export function clearAllNotifications(userId: string) {
  saveNotifications(userId, []);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function notifyAchievementUnlocks(userId: string, achievementIds: string[]) {
  for (const achievementId of achievementIds) {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.id === achievementId);
    if (!def) continue;
    pushNotification(userId, {
      type: "achievement",
      title: `Achievement unlocked: ${def.title}`,
      body: def.description,
      href: ROUTES.STUDENT.ACHIEVEMENTS,
      dedupeKey: `achievement:${achievementId}`,
    });
  }
}

function notifyStreakMilestones(userId: string, streak: number) {
  if (!STREAK_MILESTONES.includes(streak as (typeof STREAK_MILESTONES)[number])) return;
  pushNotification(userId, {
    type: "streak",
    title: `${streak}-day streak!`,
    body: `You've kept your learning streak alive for ${streak} days. Keep going!`,
    href: ROUTES.STUDENT.ACHIEVEMENTS,
    dedupeKey: `streak:${streak}`,
  });
}

export function notifyLevelUp(userId: string, level: number, levelTitle: string) {
  pushNotification(userId, {
    type: "level_up",
    title: `Level ${level} reached`,
    body: `You're now a ${levelTitle}. New milestones await!`,
    href: ROUTES.STUDENT.ANALYTICS,
    dedupeKey: `level:${level}`,
  });
}

export function notifyLessonComplete(
  userId: string,
  lessonTitle: string,
  courseTitle: string,
  href: string,
) {
  pushNotification(userId, {
    type: "lesson_complete",
    title: "Lesson completed",
    body: `You finished "${lessonTitle}" in ${courseTitle}.`,
    href,
    dedupeKey: `lesson_complete:${href}:${todayKey()}`,
  });
}

export function notifyStreakReminder(userId: string, streak: number) {
  pushNotification(userId, {
    type: "reminder",
    title: "Don't lose your streak!",
    body: `You have a ${streak}-day streak. Complete a lesson today to keep it going.`,
    href: ROUTES.STUDENT.HOME,
    dedupeKey: `streak_reminder:${todayKey()}`,
  });
}

export function notifyWelcome(userId: string) {
  pushNotification(userId, {
    type: "system",
    title: "Welcome to Planitt Learn",
    body: "Complete lessons, build streaks, and earn achievements as you learn.",
    href: ROUTES.STUDENT.HOME,
    dedupeKey: "welcome",
  });
}

/** Check level change after XP gain. Call with XP before and after. */
export function checkLevelUpNotification(userId: string, xpBefore: number, xpAfter: number) {
  const before = getLevelInfo(xpBefore);
  const after = getLevelInfo(xpAfter);
  if (after.level > before.level) {
    notifyLevelUp(userId, after.level, after.title);
  }
}

/** Sync contextual notifications from learning activity. */
export function syncNotifications(userId: string): Notification[] {
  const newlyUnlocked = syncAchievements(userId);
  notifyAchievementUnlocks(userId, newlyUnlocked);

  const gamification = loadGamification(userId);
  notifyStreakMilestones(userId, gamification.streak);
  notifyStreakMilestones(userId, gamification.longestStreak);

  const today = todayKey();
  if (
    gamification.streak > 0 &&
    gamification.lastActiveDate &&
    gamification.lastActiveDate !== today
  ) {
    notifyStreakReminder(userId, gamification.streak);
  }

  const list = getNotifications(userId);
  if (list.length === 0) {
    notifyWelcome(userId);
  }

  return getNotifications(userId);
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  achievement: "Achievements",
  level_up: "Level ups",
  streak: "Streaks",
  lesson_complete: "Lessons",
  reminder: "Reminders",
  leaderboard: "Leaderboard",
  system: "System",
};
