"use client";

import { Sparkles, Sun } from "lucide-react";

import { XpBar, StreakBadge } from "@/features/gamification";
import { cn } from "@/lib/utils";

type WelcomeHeroProps = {
  firstName: string;
  enrolledCount: number;
  lessonsCompleted: number;
  avgProgress: number;
  streak: number;
  xp: number;
  className?: string;
};

const GREETINGS = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return GREETINGS.morning;
  if (h < 17) return GREETINGS.afternoon;
  return GREETINGS.evening;
}

export function WelcomeHero({
  firstName,
  enrolledCount,
  lessonsCompleted,
  avgProgress,
  streak,
  xp,
  className,
}: WelcomeHeroProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/10 via-surface to-base p-6 sm:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

      <div className="relative grid gap-6 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Sun className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-brand">
              {getGreeting()}
            </span>
            <StreakBadge streak={streak} size="sm" />
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Hey {firstName},{" "}
            <span className="bg-gradient-to-r from-brand via-emerald-300 to-sky-400 bg-clip-text text-transparent">
              let&apos;s learn!
            </span>
          </h1>

          <p className="mt-2 max-w-lg text-sm leading-relaxed text-textSecondary">
            {lessonsCompleted > 0
              ? `You've completed ${lessonsCompleted} lesson${lessonsCompleted !== 1 ? "s" : ""} across ${enrolledCount} course${enrolledCount !== 1 ? "s" : ""}. Average progress ${avgProgress}%.`
              : "Pick a course below and start your first lesson — every expert was once a beginner."}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            Daily goal: complete 1 lesson
          </div>
        </div>

        <div className="rounded-xl border border-borderSubtle/80 bg-overlay-subtle p-4 backdrop-blur-sm">
          <XpBar xp={xp} />
        </div>
      </div>
    </div>
  );
}
