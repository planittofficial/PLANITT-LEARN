"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

import { AchievementBadge } from "@/features/achievements/components/AchievementBadge";
import { ROUTES } from "@/constants/routes";
import { useAchievements } from "@/hooks/achievements/use-achievements";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const AUTO_DISMISS_MS = 6000;
const EXIT_MS = 220;
const TICK_MS = 50;

export function AchievementUnlockToast() {
  const { user, isAuthenticated } = useAuth();
  const { pendingNotifications, dismissNotifications } = useAchievements(user?.id);

  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [extraCount, setExtraCount] = useState(0);

  const displayedRef = useRef(pendingNotifications[0] ?? null);
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

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] flex items-center justify-center p-4 transition-opacity duration-200",
        exiting ? "opacity-0" : "opacity-100",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-unlock-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] dark:bg-black/65"
        onClick={handleDismiss}
        aria-label="Dismiss achievement notification"
      />

      <div
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-2xl border border-brand/30 bg-surface shadow-theme ring-1 ring-black/5 transition-all duration-200 dark:ring-white/10",
          exiting ? "scale-95 opacity-0" : "scale-100 opacity-100 animate-in",
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
        <div className="flex items-center justify-between border-b border-brand/20 bg-brand/10 px-4 py-3">
          <p
            id="achievement-unlock-title"
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300"
          >
            <Sparkles className="h-4 w-4 shrink-0 text-brand" />
            Achievement unlocked!
            {extraCount > 0 ? ` (+${extraCount} more)` : null}
          </p>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-textMuted transition hover:bg-overlay-hover hover:text-textPrimary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-surface p-4">
          <AchievementBadge
            def={displayed.def}
            unlocked
            current={displayed.current}
            target={displayed.target}
            compact
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-[11px] text-textMuted sm:text-left">
              {paused ? "Paused — take your time" : "Closes automatically in a few seconds"}
            </p>
            <Link
              href={ROUTES.STUDENT.ACHIEVEMENTS}
              onClick={handleDismiss}
              className="text-center text-sm font-semibold text-brand hover:underline sm:text-right"
            >
              View all achievements →
            </Link>
          </div>
        </div>

        <div
          className="h-1 bg-brand/15"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Auto-dismiss timer"
        >
          <div
            className="h-full bg-brand transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
