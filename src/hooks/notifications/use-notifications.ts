"use client";

import { useCallback, useEffect, useState } from "react";

import {
  clearAllNotifications,
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  syncNotifications,
  type Notification,
  type NotificationFilter,
} from "@/lib/learning/notifications";

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
    const list = syncNotifications(userId);
    setNotifications(list);
    setUnreadCount(getUnreadCount(userId));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = useCallback(
    (notificationId: string) => {
      if (!userId) return;
      markNotificationRead(userId, notificationId);
      refresh();
    },
    [userId, refresh],
  );

  const markAllRead = useCallback(() => {
    if (!userId) return;
    markAllNotificationsRead(userId);
    refresh();
  }, [userId, refresh]);

  const remove = useCallback(
    (notificationId: string) => {
      if (!userId) return;
      deleteNotification(userId, notificationId);
      refresh();
    },
    [userId, refresh],
  );

  const clearAll = useCallback(() => {
    if (!userId) return;
    clearAllNotifications(userId);
    refresh();
  }, [userId, refresh]);

  const filterNotifications = useCallback(
    (filter: NotificationFilter) => {
      if (filter === "all") return notifications;
      if (filter === "unread") return notifications.filter((n) => !n.read);
      return notifications.filter((n) => n.type === filter);
    },
    [notifications],
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    markRead,
    markAllRead,
    remove,
    clearAll,
    filterNotifications,
  };
}
