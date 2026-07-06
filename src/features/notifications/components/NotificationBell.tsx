"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { NotificationPanel } from "@/features/notifications/components/NotificationPanel";
import { useNotifications } from "@/hooks/notifications/use-notifications";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead, refresh } = useNotifications(user?.id);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!isAuthenticated) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            if (!v) refresh();
            return !v;
          });
        }}
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-brand/30",
          open ? "bg-brand/10 text-brand" : "text-textSecondary hover:bg-overlay-hover hover:text-textPrimary",
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brandForeground dark:text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))]">
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={(id) => {
              markRead(id);
            }}
            onMarkAllRead={() => {
              markAllRead();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
