"use client";

import { BookOpen, Flame, Target, Zap } from "lucide-react";

import { XpBar, StreakBadge } from "@/features/gamification";
import { getLevelInfo } from "@/lib/learning/gamification";
import { cn } from "@/lib/utils";

type WelcomeHeroProps = {
  firstName: string;
  enrolledCount: number;
  lessonsCompleted: number;
  totalLessons: number;
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
  totalLessons,
  avgProgress,
  streak,
  xp,
  className,
}: WelcomeHeroProps) {
  const level = getLevelInfo(xp);

  const stats = [
    {
      label: "Courses",
      value: String(enrolledCount),
      icon: BookOpen,
    },
    {
      label: "Lessons",
      value: `${lessonsCompleted}/${totalLessons}`,
      icon: Target,
    },
    {
      label: "Progress",
      value: `${avgProgress}%`,
      icon: Flame,
    },
    {
      label: "XP",
      value: xp.toLocaleString(),
      icon: Zap,
    },
  ];

  return (
    <section
      className={cn(
        "rounded-2xl border border-borderSubtle bg-surface p-6 shadow-sm sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-brand">
            {getGreeting()}, {firstName}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
            Continue your learning journey
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-textSecondary">
            {lessonsCompleted > 0
              ? `You have completed ${lessonsCompleted} lesson${lessonsCompleted !== 1 ? "s" : ""} across ${enrolledCount} course${enrolledCount !== 1 ? "s" : ""}.`
              : "Choose a course below and complete your first lesson today."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StreakBadge streak={streak} size="sm" />
            <span className="rounded-full bg-overlay-medium px-3 py-1 text-xs font-medium text-textSecondary">
              Level {level.level} · {level.title}
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm rounded-xl border border-borderSubtle bg-overlay-faint p-4">
          <XpBar xp={xp} />
          <p className="mt-2 text-xs text-textMuted">
            {level.progressToNext}% to level {level.level + 1}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-borderSubtle bg-overlay-faint px-4 py-3"
          >
            <div className="flex items-center gap-2 text-textMuted">
              <stat.icon className="h-4 w-4 shrink-0 text-brand" />
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <p className="mt-1 text-xl font-bold text-textPrimary">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
