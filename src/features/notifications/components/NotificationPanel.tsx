"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import { ROUTES } from "@/constants/routes";
import type { Notification } from "@/lib/learning/notifications";
import { cn } from "@/lib/utils";

type NotificationPanelProps = {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  className?: string;
};

export function NotificationPanel({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  className,
}: NotificationPanelProps) {
  const recent = notifications.slice(0, 8);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-borderSubtle bg-surface shadow-2xl shadow-black/40",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-borderSubtle px-4 py-3">
        <div>
          <p className="font-semibold text-textPrimary">Notifications</p>
          <p className="text-xs text-textMuted">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-brand hover:bg-brand/10"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        ) : null}
      </div>

      <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
        {recent.length > 0 ? (
          <div className="divide-y divide-borderSubtle/50 p-2">
            {recent.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                compact
                onRead={onMarkRead}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <Bell className="h-8 w-8 text-textMuted" />
            <p className="text-sm font-medium text-textSecondary">No notifications yet</p>
            <p className="text-xs text-textMuted">
              Complete lessons and earn achievements to see updates here.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-borderSubtle px-4 py-2.5">
        <Link
          href={ROUTES.STUDENT.NOTIFICATIONS}
          className="block text-center text-xs font-medium text-brand hover:underline"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
