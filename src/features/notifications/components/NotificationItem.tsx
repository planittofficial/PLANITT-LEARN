"use client";

import Link from "next/link";
import {
  Award,
  Bell,
  BookOpen,
  Flame,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Notification, NotificationType } from "@/lib/learning/notifications";
import { formatNotificationTime } from "@/lib/learning/notifications";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  achievement: Award,
  level_up: Zap,
  streak: Flame,
  lesson_complete: BookOpen,
  reminder: Bell,
  leaderboard: Trophy,
  system: Sparkles,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  achievement: "text-amber-400 bg-amber-500/15",
  level_up: "text-brand bg-brand/15",
  streak: "text-orange-400 bg-orange-500/15",
  lesson_complete: "text-brand bg-brand/15",
  reminder: "text-accent bg-accent/15",
  leaderboard: "text-brand bg-brand/15",
  system: "text-textSecondary bg-overlay-strong",
};

type NotificationItemProps = {
  notification: Notification;
  compact?: boolean;
  onRead?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function NotificationItem({
  notification,
  compact = false,
  onRead,
  onDelete,
}: NotificationItemProps) {
  const Icon = TYPE_ICONS[notification.type];
  const color = TYPE_COLORS[notification.type];

  const content = (
    <div
      className={cn(
        "flex gap-3 rounded-lg border transition",
        notification.read
          ? "border-transparent bg-transparent"
          : "border-brand/10 bg-brand/5",
        compact ? "p-2.5" : "p-4",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg",
          compact ? "h-9 w-9" : "h-10 w-10",
          color,
        )}
      >
        <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "font-medium leading-snug",
              compact ? "text-sm" : "text-base",
              notification.read ? "text-textSecondary" : "text-textPrimary",
            )}
          >
            {notification.title}
          </p>
          {!notification.read ? (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
          ) : null}
        </div>
        <p className={cn("mt-0.5 text-textMuted", compact ? "text-xs" : "text-sm")}>
          {notification.body}
        </p>
        <p className="mt-1.5 text-[10px] text-textMuted">
          {formatNotificationTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  const handleClick = () => {
    if (!notification.read) onRead?.(notification.id);
  };

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        onClick={handleClick}
        className="block hover:bg-overlay-faint"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="block w-full text-left hover:bg-overlay-faint"
    >
      {content}
    </button>
  );
}
