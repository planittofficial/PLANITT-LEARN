"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

import { AchievementBadge } from "@/features/achievements/components/AchievementBadge";
import { ROUTES } from "@/constants/routes";
import { useAchievements } from "@/hooks/achievements/use-achievements";
import { useAuth } from "@/context/auth-context";

export function AchievementUnlockToast() {
  const { user, isAuthenticated } = useAuth();
  const { pendingNotifications, dismissNotifications } = useAchievements(user?.id);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isAuthenticated && pendingNotifications.length > 0);
  }, [isAuthenticated, pendingNotifications.length]);

  if (!visible || pendingNotifications.length === 0) return null;

  const latest = pendingNotifications[0];

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 md:bottom-6">
      <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-surface shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-borderSubtle bg-amber-500/10 px-4 py-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            Achievement unlocked!
            {pendingNotifications.length > 1
              ? ` (+${pendingNotifications.length - 1} more)`
              : null}
          </p>
          <button
            type="button"
            onClick={() => {
              dismissNotifications();
              setVisible(false);
            }}
            className="rounded-lg p-1 text-textMuted hover:bg-overlay-hover hover:text-textPrimary"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-3">
          <AchievementBadge
            def={latest.def}
            unlocked
            current={latest.current}
            target={latest.target}
            compact
          />
          <Link
            href={ROUTES.STUDENT.ACHIEVEMENTS}
            onClick={() => dismissNotifications()}
            className="mt-3 block text-center text-xs font-medium text-brand hover:underline"
          >
            View all achievements →
          </Link>
        </div>
      </div>
    </div>
  );
}
