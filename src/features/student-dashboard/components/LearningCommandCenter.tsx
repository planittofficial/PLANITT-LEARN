"use client";

import Link from "next/link";
import { Flame, Play, TrendingUp, Zap } from "lucide-react";

import type { CourseDefinition } from "@/lib/catalog/courses";
import type { WeeklyDay } from "@/lib/learning/activity";
import { getLevelInfo } from "@/lib/learning/gamification";
import { cn } from "@/lib/utils";

type LastVisitedCourse = {
  course: CourseDefinition;
  percent: number;
  completed: number;
  total: number;
  continueUrl: string;
  lastLessonTitle?: string;
  watchedAt?: string;
};

type LearningCommandCenterProps = {
  streak: number;
  xp: number;
  weeklyDays: WeeklyDay[];
  lastVisitedCourse?: LastVisitedCourse;
  coursesInProgress: number;
  className?: string;
};

function formatVisitedAt(iso?: string): string | null {
  if (!iso) return null;
  const visited = new Date(iso);
  if (Number.isNaN(visited.getTime())) return null;

  const diffMs = Date.now() - visited.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return visited.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LearningCommandCenter({
  streak,
  xp,
  weeklyDays,
  lastVisitedCourse,
  coursesInProgress,
  className,
}: LearningCommandCenterProps) {
  const level = getLevelInfo(xp);
  const lessonsThisWeek = weeklyDays.reduce((sum, day) => sum + day.lessonsCompleted, 0);
  const maxDay = Math.max(1, ...weeklyDays.map((day) => day.lessonsCompleted));
  const xpToNext =
    level.nextMinXp !== null ? Math.max(0, level.nextMinXp - xp) : 0;
  const visitedAgo = formatVisitedAt(lastVisitedCourse?.watchedAt);

  return (
    <section
      className={cn(
        "learning-command-center group relative min-h-[320px] overflow-hidden rounded-lg border border-borderSubtle bg-surface/60 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-brand/40",
        className,
      )}
    >
      <div className="glow-border" />
      <div className="radar-grid absolute inset-0 opacity-30" />
      <div className="grain-overlay absolute inset-0" />
      <div className="learning-radar-sweep absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" />

      <div className="relative z-10 flex h-full min-h-[320px] flex-col p-6 md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-[1.5px] w-2 bg-brand" />
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-brand">
                Learning pulse
              </span>
            </div>
            <h3 className="font-headline text-xl font-extrabold tracking-tight text-textPrimary md:text-2xl">
              Your mission control
            </h3>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-brand">
              Live
            </span>
          </div>
        </div>

        <div className="grid flex-1 gap-6 md:grid-cols-[180px_1fr] md:items-center">
          <div className="relative mx-auto flex aspect-square w-full max-w-[180px] items-center justify-center md:mx-0">
            <div className="absolute inset-0 rounded-full border border-brand/15" />
            <div className="absolute inset-3 rounded-full border border-brand/20" />
            <div className="absolute inset-7 rounded-full border border-dashed border-brand/25" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.14)_0%,transparent_68%)]" />

            <div className="relative flex flex-col items-center text-center">
              <Flame className="mb-1 h-5 w-5 text-brand" />
              <p className="font-mono text-4xl font-black leading-none text-textPrimary">{streak}</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-textMuted">
                Day streak
              </p>
            </div>

            {weeklyDays.map((day, index) => {
              const angle = (index / weeklyDays.length) * 360 - 90;
              const active = day.lessonsCompleted > 0;
              const radius = 78;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <span
                  key={day.date}
                  title={`${day.label}: ${day.lessonsCompleted} lesson${day.lessonsCompleted === 1 ? "" : "s"}`}
                  className={cn(
                    "absolute h-2 w-2 rounded-full transition-all",
                    active
                      ? "bg-brand shadow-[0_0_10px_rgba(20,184,166,0.8)]"
                      : "bg-white/10",
                  )}
                  style={{
                    left: `calc(50% + ${x}px - 4px)`,
                    top: `calc(50% + ${y}px - 4px)`,
                  }}
                />
              );
            })}
          </div>

          <div className="flex flex-col justify-center gap-5">
            {lastVisitedCourse ? (
              <div className="rounded-lg border border-borderSubtle bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-brand">
                    Last visited
                  </p>
                  {visitedAgo ? (
                    <p className="font-mono text-[9px] uppercase tracking-wider text-textMuted">
                      {visitedAgo}
                    </p>
                  ) : null}
                </div>
                <p className="mt-2 font-headline text-lg font-bold leading-snug text-textPrimary">
                  {lastVisitedCourse.course.title}
                </p>
                {lastVisitedCourse.lastLessonTitle ? (
                  <p className="mt-1 text-sm text-textSecondary">
                    {lastVisitedCourse.lastLessonTitle}
                  </p>
                ) : null}
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-textMuted">
                    <span>
                      {lastVisitedCourse.completed}/{lastVisitedCourse.total} lessons
                    </span>
                    <span>{lastVisitedCourse.percent}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand to-brandBright transition-all duration-500"
                      style={{ width: `${lastVisitedCourse.percent}%` }}
                    />
                  </div>
                </div>
                <Link
                  href={lastVisitedCourse.continueUrl}
                  className="mt-4 inline-flex items-center gap-2 rounded bg-brand px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black transition hover:brightness-110 active:scale-95"
                >
                  Resume lesson
                  <Play className="h-3.5 w-3.5 fill-current" />
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border border-borderSubtle bg-black/20 p-4">
                <p className="font-headline text-lg font-bold text-textPrimary">Start a lesson</p>
                <p className="mt-1 text-sm text-textSecondary">
                  Open a course below and it will appear here next time you return.
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <StatChip
                icon={<Zap className="h-3.5 w-3.5" />}
                label="This week"
                value={`${lessonsThisWeek}`}
                hint="lessons"
              />
              <StatChip
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                label="Active"
                value={`${coursesInProgress}`}
                hint="courses"
              />
              <StatChip
                icon={<Flame className="h-3.5 w-3.5" />}
                label="To level up"
                value={xpToNext > 0 ? `${xpToNext}` : "Max"}
                hint="XP"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-textMuted">
                <span>
                  Level {level.level} · {level.title}
                </span>
                <span>{level.progressToNext}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand/80 via-brand to-accent transition-all duration-500"
                  style={{ width: `${level.progressToNext}%` }}
                />
              </div>
            </div>

            <div className="flex items-end gap-1.5 pt-1">
              {weeklyDays.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-10 w-full items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-sm transition-all duration-500",
                        day.lessonsCompleted > 0
                          ? "bg-gradient-to-t from-brand to-brandBright"
                          : "bg-white/8",
                      )}
                      style={{
                        height: `${Math.max(12, (day.lessonsCompleted / maxDay) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[9px] uppercase text-textMuted">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatChip({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-borderSubtle bg-black/20 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-brand">{icon}</div>
      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-textMuted">{label}</p>
      <p className="font-mono text-lg font-black leading-none text-textPrimary">
        {value}
        <span className="ml-1 text-[9px] font-semibold text-textMuted">{hint}</span>
      </p>
    </div>
  );
}
