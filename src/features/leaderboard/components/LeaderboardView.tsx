"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Medal, Trophy } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, LeaderboardEmpty } from "@/components/shared/EmptyState";
import { useAuth } from "@/context/auth-context";
import { useCourses } from "@/hooks/courses/use-courses";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { useLeaderboard, type LeaderboardEntry } from "@/hooks/leaderboard/use-leaderboard";
import { useUserPreferences } from "@/hooks/profile/use-user-preferences";
import { apiCourseListItemToDefinition } from "@/lib/catalog/map-api-course";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { cn } from "@/lib/utils";

function getMockYield(score: number): string {
  const base = 5.25;
  const growth = score / 200;
  return `+${(base + growth).toFixed(2)}%`;
}

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: number }) {
  const borderColors = [
    "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.12)] bg-surface/80",
    "border-slate-400/20 shadow-[0_0_15px_rgba(156,163,175,0.08)] bg-surface/60",
    "border-orange-500/20 shadow-[0_0_15px_rgba(217,119,6,0.08)] bg-surface/60",
  ];

  const initials = entry.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  const yieldPct = getMockYield(entry.totalScore);

  const titleBadges = ["Top Learner", "Fast Mover", "Consistent Climber"];
  const title = titleBadges[place] || "Learner";

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center overflow-hidden rounded-lg border p-6 text-center transition-all duration-300 hover:border-brand/40",
        borderColors[place],
        entry.isCurrentUser && "ring-1 ring-brand",
      )}
    >
      <div className="glow-border" />
      <div className="pointer-events-none absolute inset-0 radar-grid opacity-10" />

      <div className="relative z-10 mb-4">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full border font-mono text-lg font-bold",
            place === 0
              ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
              : place === 1
                ? "border-slate-400/30 bg-slate-400/10 text-slate-400"
                : "border-orange-500/30 bg-orange-500/10 text-orange-500",
          )}
        >
          {initials}
        </div>
        <span className="absolute -bottom-1 -right-1 rounded border border-borderSubtle bg-elevated px-2 py-0.5 font-mono text-[9px] font-bold leading-none text-textPrimary">
          #{place + 1}
        </span>
      </div>

      <p className="z-10 w-full truncate font-headline text-lg font-bold text-textPrimary">
        {entry.name}
      </p>
      <p className="z-10 mt-1 font-mono text-[9px] font-bold uppercase tracking-widest text-brand/70">
        {title}
      </p>

      <div className="z-10 mt-4 flex flex-col items-center">
        <span className="font-mono text-3xl font-extrabold leading-none tracking-tighter text-brand">
          {entry.totalScore.toLocaleString()}
        </span>
        <span className="mt-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-textMuted">
          Score points
        </span>
      </div>

      <div className="z-10 mt-4 flex items-center gap-1.5 rounded-sm border border-emerald-500/10 bg-emerald-500/5 px-3 py-1 font-mono text-[10px] font-bold text-emerald-500">
        <ArrowUpRight className="h-3.5 w-3.5" />
        <span>Progress signal: {yieldPct}</span>
      </div>
    </div>
  );
}

function RankingRow({ entry }: { entry: LeaderboardEntry }) {
  const initials = entry.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  const yieldPct = getMockYield(entry.totalScore);

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-lg border border-borderSubtle bg-surface/60 px-5 py-4 backdrop-blur-md transition-all duration-200 hover:border-brand/40",
        entry.isCurrentUser && "border-brand/30 bg-brand/5 shadow-[0_0_12px_rgba(20,184,166,0.05)]",
      )}
    >
      <div className="glow-border" />
      <span
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded border font-mono text-xs font-bold",
          entry.rank <= 3
            ? "border-brand/20 bg-brand/10 text-brand"
            : "border-borderSubtle bg-elevated text-textSecondary",
        )}
      >
        {String(entry.rank).padStart(2, "0")}
      </span>

      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-borderSubtle bg-elevated font-mono text-xs font-bold text-textSecondary">
        {initials}
      </div>

      <div className="relative z-10 min-w-0 flex-1">
        <p className="flex items-center gap-2 font-headline text-sm font-bold text-textPrimary">
          {entry.name}
          {entry.isCurrentUser ? (
            <span className="rounded border border-brand/25 bg-brand/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brand">
              You
            </span>
          ) : null}
        </p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-textSecondary">
          {entry.lessonsCompleted} lessons complete · {entry.completionPercent}% · {yieldPct}
        </p>
      </div>

      <div className="relative z-10 text-right">
        <p className="font-mono text-base font-extrabold leading-none tracking-tighter text-brand">
          {entry.totalScore.toLocaleString()}
        </p>
        <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-widest text-textMuted">
          Points
        </p>
      </div>
    </div>
  );
}

export function LeaderboardView() {
  const { user } = useAuth();
  const { enrolledIds, loading: enrollmentLoading } = useEnrollment();
  const { data: apiCourses, isLoading: coursesLoading } = useCourses();
  const { prefs, updatePreferences } = useUserPreferences(user?.id);

  const enrolledCourses = useMemo(
    () =>
      apiCourses
        .map(apiCourseListItemToDefinition)
        .filter((course) => isEnrolledInCourse(enrolledIds, course.id)),
    [apiCourses, enrolledIds],
  );

  const defaultCourseId =
    (prefs.preferredCourseId &&
    enrolledCourses.some((course) => course.id === prefs.preferredCourseId)
      ? prefs.preferredCourseId
      : enrolledCourses[0]?.id) ?? "";

  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourseId);

  useEffect(() => {
    if (!defaultCourseId) return;
    if (!selectedCourseId || !enrolledCourses.some((c) => c.id === selectedCourseId)) {
      setSelectedCourseId(defaultCourseId);
    }
  }, [defaultCourseId, enrolledCourses, selectedCourseId]);

  const { entries, isLoading } = useLeaderboard(selectedCourseId || undefined);
  const selectedCourse = enrolledCourses.find((course) => course.id === selectedCourseId);

  if (enrollmentLoading || coursesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-lg" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Enroll to join the leaderboard"
        description="Purchase a course on Alvest to unlock rankings for your learning track."
      />
    );
  }

  return (
    <div className="animate-in fade-in space-y-8">
      <section className="relative overflow-hidden rounded-lg border border-borderSubtle bg-surface/60 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <div className="absolute right-4 top-4 font-mono text-[9px] uppercase tracking-widest text-brand/40">
          Sync: live
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-[1.5px] w-2 bg-brand" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-brand">
            Learner rankings
          </span>
        </div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-textPrimary">
          Learning leaderboard
        </h1>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-textSecondary">
          Rankings for {selectedCourse?.title ?? "your course"} — based on lesson progress and quiz
          activity.
        </p>

        {enrolledCourses.length > 1 ? (
          <label className="mt-5 block max-w-md">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-textMuted">
              Course
            </span>
            <select
              value={selectedCourseId}
              onChange={(event) => {
                const next = event.target.value;
                setSelectedCourseId(next);
                updatePreferences({ preferredCourseId: next });
              }}
              className="mt-1.5 w-full rounded-lg border border-borderSubtle bg-elevated px-3 py-2.5 text-sm text-textPrimary outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20"
            >
              {enrolledCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </section>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <LeaderboardEmpty />
      ) : (
        <>
          <div className="grid items-end gap-6 pt-4 sm:grid-cols-3">
            {entries[1] ? (
              <div className="order-2 sm:order-1">
                <PodiumCard entry={entries[1]} place={1} />
              </div>
            ) : null}
            {entries[0] ? (
              <div className="z-10 order-1 sm:-mt-6 sm:order-2">
                <PodiumCard entry={entries[0]} place={0} />
              </div>
            ) : null}
            {entries[2] ? (
              <div className="order-3 sm:order-3">
                <PodiumCard entry={entries[2]} place={2} />
              </div>
            ) : null}
          </div>

          {entries.length > 3 ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-borderSubtle px-2 pb-3">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4 text-brand" />
                  <span className="font-headline text-base font-bold uppercase tracking-wider text-textPrimary">
                    All rankings
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-textSecondary">
                  {entries.length} participants
                </span>
              </div>
              <div className="space-y-3">
                {entries.slice(3).map((entry) => (
                  <RankingRow key={entry.userId} entry={entry} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
