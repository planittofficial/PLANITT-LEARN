"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/hooks/notifications/use-notifications";
import {
  NOTIFICATION_TYPE_LABELS,
  type NotificationFilter,
  type NotificationType,
} from "@/lib/learning/notifications";
import { cn } from "@/lib/utils";

const FILTERS: NotificationFilter[] = [
  "all",
  "unread",
  "achievement",
  "level_up",
  "streak",
  "lesson_complete",
  "reminder",
  "system",
];

export function NotificationsView() {
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, filterNotifications, markRead, markAllRead, clearAll } =
    useNotifications(user?.id);
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const filtered = useMemo(() => filterNotifications(filter), [filter, filterNotifications]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded-2xl bg-overlay-hover" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-overlay-hover" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-surface to-brand/5 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-sky-400">
          <Bell className="h-3.5 w-3.5" />
          Notifications
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Your activity feed</h1>
        <p className="mt-2 max-w-xl text-sm text-textSecondary">
          Achievements, streaks, level-ups, and learning reminders — all in one place.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-borderSubtle bg-overlay-subtle px-4 py-2">
            <p className="text-xs text-textMuted">Unread</p>
            <p className="text-xl font-bold">{unreadCount}</p>
          </div>
          <div className="rounded-xl border border-borderSubtle bg-overlay-subtle px-4 py-2">
            <p className="text-xs text-textMuted">Total</p>
            <p className="text-xl font-bold">{notifications.length}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 rounded-xl border border-borderSubtle px-3 py-2 text-xs font-medium text-textSecondary hover:border-brand/30 hover:text-brand"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            ) : null}
            {notifications.length > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-borderSubtle px-3 py-2 text-xs font-medium text-textMuted hover:border-rose-500/30 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count =
            f === "all"
              ? notifications.length
              : f === "unread"
                ? unreadCount
                : notifications.filter((n) => n.type === f).length;
          if (f !== "all" && f !== "unread" && count === 0) return null;

          const label =
            f === "all"
              ? "All"
              : f === "unread"
                ? "Unread"
                : NOTIFICATION_TYPE_LABELS[f as NotificationType];

          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                filter === f
                  ? "bg-brand/15 text-brand"
                  : "bg-overlay-hover text-textMuted hover:text-textSecondary",
              )}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-borderSubtle bg-surface p-2 sm:p-3">
          {filtered.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markRead}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-borderSubtle bg-surface px-6 py-16 text-center">
          <Bell className="mx-auto h-10 w-10 text-textMuted" />
          <p className="mt-3 font-medium text-textSecondary">No notifications in this view</p>
          <p className="mt-1 text-sm text-textMuted">
            {filter === "unread"
              ? "You've read everything — nice work!"
              : "Complete a lesson to start building your feed."}
          </p>
        </div>
      )}
    </div>
  );
}
