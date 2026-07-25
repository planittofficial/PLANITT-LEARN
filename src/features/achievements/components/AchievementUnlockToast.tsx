"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Star, Trophy, X } from "lucide-react";

import { ACHIEVEMENT_ICONS } from "@/features/achievements/components/AchievementBadge";
import { ROUTES } from "@/constants/routes";
import { useAchievements } from "@/hooks/achievements/use-achievements";
import { useAuth } from "@/context/auth-context";
import type { AchievementProgress, AchievementRarity } from "@/lib/learning/achievements";
import { cn } from "@/lib/utils";

const AUTO_DISMISS_MS = 6500;
const EXIT_MS = 240;
const TICK_MS = 50;

const RARITY_THEME: Record<
  AchievementRarity,
  {
    label: string;
    hero: string;
    glow: string;
    medallion: string;
    iconColor: string;
    chip: string;
    progress: string;
  }
> = {
  common: {
    label: "Common",
    hero: "from-emerald-500/25 via-brand/15 to-teal-400/10 dark:from-emerald-500/20 dark:via-brand/10 dark:to-teal-500/5",
    glow: "bg-brand/30",
    medallion: "from-emerald-400 to-teal-500 shadow-brand/30",
    iconColor: "text-white",
    chip: "bg-brand/12 text-emerald-800 ring-brand/25 dark:text-emerald-300",
    progress: "bg-brand",
  },
  rare: {
    label: "Rare",
    hero: "from-sky-500/25 via-sky-400/10 to-blue-500/5 dark:from-sky-500/20 dark:via-sky-400/10 dark:to-blue-500/5",
    glow: "bg-sky-400/35",
    medallion: "from-sky-400 to-blue-500 shadow-sky-500/35",
    iconColor: "text-white",
    chip: "bg-sky-500/12 text-sky-800 ring-sky-500/25 dark:text-sky-300",
    progress: "bg-sky-500",
  },
  epic: {
    label: "Epic",
    hero: "from-violet-500/25 via-fuchsia-500/10 to-purple-500/5 dark:from-violet-500/20 dark:via-fuchsia-500/10 dark:to-purple-500/5",
    glow: "bg-violet-400/35",
    medallion: "from-violet-400 to-fuchsia-500 shadow-violet-500/35",
    iconColor: "text-white",
    chip: "bg-violet-500/12 text-violet-800 ring-violet-500/25 dark:text-violet-300",
    progress: "bg-violet-500",
  },
  legendary: {
    label: "Legendary",
    hero: "from-amber-500/30 via-orange-400/15 to-yellow-500/10 dark:from-amber-500/25 dark:via-orange-400/10 dark:to-yellow-500/5",
    glow: "bg-amber-400/40",
    medallion: "from-amber-400 via-orange-400 to-yellow-500 shadow-amber-500/40",
    iconColor: "text-white",
    chip: "bg-amber-500/15 text-amber-900 ring-amber-500/30 dark:text-amber-200",
    progress: "bg-amber-500",
  },
};

export function AchievementUnlockToast() {
  const { user, isAuthenticated } = useAuth();
  const { pendingNotifications, dismissNotifications } = useAchievements(user?.id);

  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [extraCount, setExtraCount] = useState(0);

  const displayedRef = useRef<AchievementProgress | null>(pendingNotifications[0] ?? null);
  const remainingMsRef = useRef(AUTO_DISMISS_MS);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const handleDismiss = useCallback(() => {
    if (exiting) return;

    clearTimers();
    setExiting(true);
    setPaused(false);

    exitTimerRef.current = setTimeout(() => {
      dismissNotifications();
      setOpen(false);
      setExiting(false);
      setProgress(100);
      remainingMsRef.current = AUTO_DISMISS_MS;
      displayedRef.current = null;
    }, EXIT_MS);
  }, [clearTimers, dismissNotifications, exiting]);

  useEffect(() => {
    if (!isAuthenticated || pendingNotifications.length === 0) return;

    displayedRef.current = pendingNotifications[0];
    setExtraCount(Math.max(0, pendingNotifications.length - 1));
    setOpen(true);
    setExiting(false);
    setPaused(false);
    setProgress(100);
    remainingMsRef.current = AUTO_DISMISS_MS;
  }, [isAuthenticated, pendingNotifications.length, pendingNotifications[0]?.def.id]);

  useEffect(() => {
    if (!open || exiting || paused) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    tickRef.current = setInterval(() => {
      remainingMsRef.current = Math.max(0, remainingMsRef.current - TICK_MS);
      setProgress((remainingMsRef.current / AUTO_DISMISS_MS) * 100);

      if (remainingMsRef.current <= 0) {
        handleDismiss();
      }
    }, TICK_MS);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [open, exiting, paused, handleDismiss]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleDismiss();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleDismiss]);

  useEffect(() => clearTimers, [clearTimers]);

  const displayed = displayedRef.current;
  if ((!open && !exiting) || !displayed) return null;

  const { def } = displayed;
  const theme = RARITY_THEME[def.rarity];
  const Icon = ACHIEVEMENT_ICONS[def.icon];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6",
        "transition-opacity duration-200",
        exiting ? "opacity-0" : "opacity-100",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-unlock-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm dark:bg-black/70"
        onClick={handleDismiss}
        aria-label="Dismiss achievement notification"
      />

      <div
        className={cn(
          "relative w-full max-w-[22rem] overflow-hidden rounded-3xl border border-borderSubtle bg-surface shadow-theme",
          "ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
          "transition-all duration-200",
          exiting ? "scale-95 opacity-0" : "achievement-modal-enter",
        )}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        {/* Hero */}
        <div className={cn("relative px-6 pb-14 pt-8", "bg-gradient-to-b", theme.hero)}>
          <div
            className={cn(
              "pointer-events-none absolute left-1/2 top-8 h-28 w-28 -translate-x-1/2 rounded-full blur-3xl",
              theme.glow,
            )}
          />

          <button
            type="button"
            onClick={handleDismiss}
            className="absolute right-3 top-3 rounded-full p-2 text-textMuted transition hover:bg-overlay-hover hover:text-textPrimary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <Sparkles
            className="achievement-sparkle pointer-events-none absolute left-6 top-10 h-4 w-4 text-brand"
            aria-hidden
          />
          <Star
            className="achievement-sparkle pointer-events-none absolute right-8 top-14 h-3.5 w-3.5 text-amber-400 [animation-delay:0.6s]"
            aria-hidden
          />
          <Trophy
            className="achievement-sparkle pointer-events-none absolute left-10 top-20 h-3 w-3 text-sky-400 [animation-delay:1.1s]"
            aria-hidden
          />

          <div className="relative mx-auto flex w-fit flex-col items-center">
            <div
              className={cn(
                "achievement-medallion-pop relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full",
                "bg-gradient-to-br shadow-2xl ring-4 ring-white/70 dark:ring-white/15",
                theme.medallion,
              )}
            >
              <div className="absolute inset-2 rounded-full border border-white/25" />
              <Icon className={cn("relative h-9 w-9", theme.iconColor)} strokeWidth={1.75} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="-mt-10 px-6 pb-6 pt-0">
          <div className="rounded-2xl border border-borderSubtle bg-surface px-5 py-5 text-center shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
              Achievement unlocked
            </p>
            <h2
              id="achievement-unlock-title"
              className="mt-2 text-xl font-bold leading-tight text-textPrimary sm:text-2xl"
            >
              {def.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-textSecondary">{def.description}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset",
                  theme.chip,
                )}
              >
                {theme.label}
              </span>
              {extraCount > 0 ? (
                <span className="inline-flex items-center rounded-full bg-overlay-medium px-2.5 py-1 text-[10px] font-semibold text-textMuted">
                  +{extraCount} more waiting
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-bold text-brandForeground transition hover:bg-brandHover active:scale-[0.99]"
            >
              Continue learning
            </button>
            <Link
              href={ROUTES.STUDENT.ACHIEVEMENTS}
              onClick={handleDismiss}
              className="block w-full rounded-xl border border-borderSubtle px-4 py-2.5 text-center text-sm font-semibold text-textPrimary transition hover:bg-overlay-hover"
            >
              View all achievements
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div
              className="h-1 flex-1 overflow-hidden rounded-full bg-overlay-medium"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-label="Auto-dismiss timer"
            >
              <div
                className={cn("h-full rounded-full transition-[width] duration-75 ease-linear", theme.progress)}
                style={{ width: `${progress}%` }}
              />
            </div>
            {paused ? (
              <span className="shrink-0 text-[10px] font-medium text-textMuted">Paused</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
