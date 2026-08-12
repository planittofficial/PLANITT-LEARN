"use client";

import { BookOpen, Flame, Trophy, Zap } from "lucide-react";

import type { WeeklyDay } from "@/lib/learning/activity";
import { getLevelInfo } from "@/lib/learning/gamification";
import { cn } from "@/lib/utils";

const LEVEL_COUNT = 6;

type LearnerStatsSidebarProps = {
  xp: number;
  streak: number;
  lessonsCompletedTotal: number;
  weeklyDays: WeeklyDay[];
};

export function LearnerStatsSidebar({
  xp,
  streak,
  lessonsCompletedTotal,
  weeklyDays,
}: LearnerStatsSidebarProps) {
  const level = getLevelInfo(xp);
  const xpToNext = level.nextMinXp !== null ? Math.max(0, level.nextMinXp - xp) : 0;
  const weeklyXp = weeklyDays.reduce((sum, day) => sum + day.lessonsCompleted, 0) * 50;
  const maxWeekly = Math.max(1, ...weeklyDays.map((day) => day.lessonsCompleted));
  const nextTitle = level.nextTitle ?? "Max rank";

  return (
    <div className="flex h-full min-h-[320px] flex-col gap-4">
      <article className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-borderSubtle bg-surface/60 p-5 backdrop-blur-md transition hover:border-brand/40">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand/10 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand/25 bg-brand/10 text-brand">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-textMuted">
                Learning points
              </p>
              <p className="font-mono text-[9px] text-brand/70">+50 XP / lesson</p>
            </div>
          </div>
          {weeklyXp > 0 ? (
            <span className="rounded-full border border-brand/20 bg-brand/10 px-2 py-0.5 font-mono text-[9px] font-bold text-brand">
              +{weeklyXp} this week
            </span>
          ) : (
            <span className="rounded-full border border-borderSubtle px-2 py-0.5 font-mono text-[9px] text-textMuted">
              No XP yet this week
            </span>
          )}
        </div>

        <div className="relative z-10 mt-5 flex items-end justify-between gap-4">
          <p className="font-mono text-5xl font-black leading-none tracking-tighter text-brand">
            {xp.toLocaleString()}
          </p>
          <div className="flex h-10 items-end gap-1">
            {weeklyDays.map((day) => (
              <span
                key={day.date}
                title={`${day.label}: ${day.lessonsCompleted} lesson${day.lessonsCompleted === 1 ? "" : "s"}`}
                className={cn(
                  "w-1.5 rounded-full transition-all",
                  day.lessonsCompleted > 0 ? "bg-brand" : "bg-white/10",
                )}
                style={{ height: `${Math.max(6, (day.lessonsCompleted / maxWeekly) * 40)}px` }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-2 gap-2">
          <MiniStat icon={<BookOpen className="h-3.5 w-3.5" />} label="Lessons done" value={`${lessonsCompletedTotal}`} />
          <MiniStat icon={<Flame className="h-3.5 w-3.5" />} label="Streak" value={`${streak}d`} />
        </div>
      </article>

      <article className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-borderSubtle bg-surface/60 p-5 backdrop-blur-md transition hover:border-brand/40">
        <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-brand/8 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand/25 bg-brand/10 text-brand">
              <Trophy className="h-4 w-4" />
            </span>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-textMuted">
              Learner level
            </p>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-textMuted">
            {level.level}/{LEVEL_COUNT}
          </span>
        </div>

        <div className="relative z-10 mt-4">
          <p className="font-headline text-3xl font-black tracking-tight text-textPrimary">
            Level {level.level}
          </p>
          <p className="mt-1 text-sm font-medium text-brand">{level.title}</p>
        </div>

        <div className="relative z-10 mt-4 flex gap-1.5">
          {Array.from({ length: LEVEL_COUNT }, (_, index) => {
            const step = index + 1;
            const filled = step <= level.level;
            const current = step === level.level;
            return (
              <span
                key={step}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all",
                  filled ? "bg-brand" : "bg-white/10",
                  current && "shadow-[0_0_10px_rgba(20,184,166,0.55)]",
                )}
              />
            );
          })}
        </div>

        <div className="relative z-10 mt-auto pt-4">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-textMuted">
            <span>
              {level.nextLevel
                ? `${xpToNext} XP to ${nextTitle}`
                : "Highest rank unlocked"}
            </span>
            <span>{level.progressToNext}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brandBright transition-all duration-500"
              style={{ width: `${level.progressToNext}%` }}
            />
          </div>
        </div>
      </article>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-borderSubtle bg-black/20 px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 text-brand">{icon}</div>
      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-textMuted">{label}</p>
      <p className="font-mono text-base font-black leading-none text-textPrimary">{value}</p>
    </div>
  );
}
