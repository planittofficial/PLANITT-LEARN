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
    <div
      className="pointer-events-none fixed inset-x-4 top-[4.25rem] z-[60] flex justify-end sm:inset-x-auto sm:right-6 sm:top-[4.75rem]"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto w-full max-w-sm animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="overflow-hidden rounded-2xl border border-brand/30 bg-surface/95 shadow-theme backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10">
          <div className="flex items-center justify-between border-b border-brand/20 bg-brand/10 px-4 py-2.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand" />
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
              className="rounded-lg p-1 text-textMuted transition hover:bg-overlay-hover hover:text-textPrimary"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-surface p-3">
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
              className="mt-3 block text-center text-xs font-semibold text-brand hover:underline"
            >
              View all achievements →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
