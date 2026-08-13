"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChartColumn,
  Check,
  Flame,
  Loader2,
  Mail,
  Medal,
  Settings2,
  Target,
  Trophy,
  User,
  Zap,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { useGamification, XpBar } from "@/features/gamification";
import { useAchievements } from "@/hooks/achievements/use-achievements";
import { useCourses } from "@/hooks/courses/use-courses";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { useLeaderboard } from "@/hooks/leaderboard/use-leaderboard";
import { useProfile } from "@/hooks/profile/use-profile";
import { useUserPreferences } from "@/hooks/profile/use-user-preferences";
import { apiCourseListItemToDefinition } from "@/lib/catalog/map-api-course";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { getLevelInfo } from "@/lib/learning/gamification";
import { cn } from "@/lib/utils";

export function ProfileView() {
  const { isAuthenticated, authReady, user, updateLocalUser } = useAuth();
  const { profile, isLoading, updateName, isSaving, saveError } = useProfile();
  const { enrolledIds } = useEnrollment();
  const { data: apiCourses } = useCourses();
  const gamification = useGamification(user?.id);
  const achievements = useAchievements(user?.id);
  const { prefs, updatePreferences } = useUserPreferences(user?.id);

  const enrolledCourses = useMemo(
    () =>
      apiCourses
        .map(apiCourseListItemToDefinition)
        .filter((course) => isEnrolledInCourse(enrolledIds, course.id)),
    [apiCourses, enrolledIds],
  );

  const leaderboardCourseId = useMemo(() => {
    if (prefs.preferredCourseId && enrolledIds.has(prefs.preferredCourseId)) {
      return prefs.preferredCourseId;
    }
    return [...enrolledIds][0] || "";
  }, [enrolledIds, prefs.preferredCourseId]);

  const { entries } = useLeaderboard(leaderboardCourseId || undefined);

  const [displayName, setDisplayName] = useState("");
  const [preferredCourseId, setPreferredCourseId] = useState("");
  const [emailDigest, setEmailDigest] = useState(true);
  const [weeklyGoalLessons, setWeeklyGoalLessons] = useState(3);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile && !user) return;
    const baseName = prefs.displayName || profile?.user.name || user?.name || "";
    setDisplayName(baseName);
    setPreferredCourseId(
      prefs.preferredCourseId && enrolledCourses.some((c) => c.id === prefs.preferredCourseId)
        ? prefs.preferredCourseId
        : enrolledCourses[0]?.id ?? "",
    );
    setEmailDigest(prefs.emailDigest);
    setWeeklyGoalLessons(prefs.weeklyGoalLessons);
    setShowOnLeaderboard(prefs.showOnLeaderboard);
  }, [enrolledCourses, prefs, profile, user]);

  if (!authReady) return <ProfileSkeleton />;

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view profile"
        description="Your learning stats and enrolled courses appear here after you sign in."
        icon={User}
        action={
          <Link
            href={ROUTES.STUDENT.LOGIN}
            className="inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground transition hover:bg-brandHover"
          >
            Sign in →
          </Link>
        }
      />
    );
  }

  if (isLoading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <EmptyState title="Could not load profile" description="Try refreshing the page." />
    );
  }

  const name = prefs.displayName || profile.user.name || user?.name || "Learner";
  const email = profile.user.email || user?.email || "";
  const stats = profile.stats;
  const completionPct =
    stats.totalLessons > 0
      ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100)
      : 0;
  const level = getLevelInfo(gamification.xp);
  const me =
    entries.find((entry) => entry.userId === user?.id) ??
    entries.find((entry) => entry.isCurrentUser);
  const rank = me?.rank ?? null;
  const firstName = name.split(" ")[0] ?? "Learner";

  const handleSaveSettings = async () => {
    setSettingsMessage(null);
    setSettingsError(null);
    const trimmed = displayName.trim().replace(/\s+/g, " ");
    if (trimmed.length < 2) {
      setSettingsError("Name must be at least 2 characters.");
      return;
    }

    try {
      await updateName({ name: trimmed });
      updatePreferences({
        displayName: trimmed,
        preferredCourseId,
        emailDigest,
        weeklyGoalLessons,
        showOnLeaderboard,
      });
      updateLocalUser({ name: trimmed });
      setSettingsMessage("Settings saved.");
    } catch (error) {
      // Still save local prefs even if remote name patch fails (e.g. offline).
      updatePreferences({
        displayName: trimmed,
        preferredCourseId,
        emailDigest,
        weeklyGoalLessons,
        showOnLeaderboard,
      });
      updateLocalUser({ name: trimmed });
      setSettingsError(
        error instanceof Error
          ? `${error.message} Local preferences were still saved.`
          : "Could not sync name to the server. Local preferences were saved.",
      );
    }
  };

  return (
    <div className="animate-in fade-in space-y-6">
      <header>
        <div className="flex items-center gap-2 text-brand">
          <User className="h-4 w-4" />
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em]">
            Account
          </span>
        </div>
        <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-textPrimary">
          Your profile
        </h1>
        <p className="mt-1 text-sm text-textSecondary">
          Manage your identity, learning preferences, and progress.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-borderSubtle bg-surface shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/[0.08] via-transparent to-accent/[0.05]" />
        <div className="radar-grid absolute inset-0 opacity-20" />
        <div className="relative z-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4 sm:gap-5">
            <Avatar
              name={name}
              size="lg"
              highlight
              className="h-20 w-20 text-2xl ring-offset-surface"
            />
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-brand">
                Learner profile
              </p>
              <h2 className="mt-1 truncate font-headline text-2xl font-extrabold tracking-tight text-textPrimary">
                {name}
              </h2>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-textSecondary">
                <Mail className="h-3.5 w-3.5 shrink-0 text-brand" />
                <span className="truncate">{email}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-subtle px-2.5 py-1 font-mono text-[10px] font-bold text-brand">
                  Level {level.level} · {level.title}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-borderSubtle bg-elevated px-2.5 py-1 font-mono text-[10px] font-semibold text-textSecondary">
                  <Flame className="h-3 w-3 text-brand" />
                  {gamification.streak}-day streak
                </span>
                {rank ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-borderSubtle bg-elevated px-2.5 py-1 font-mono text-[10px] font-semibold text-textSecondary">
                    <Trophy className="h-3 w-3 text-brand" />
                    Rank #{rank}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-borderSubtle bg-elevated/80 px-5 py-4 sm:min-w-[160px] sm:text-right">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-textMuted">
              Learning points
            </p>
            <p className="mt-1 font-mono text-4xl font-black leading-none tracking-tighter text-brand">
              {gamification.xp.toLocaleString()}
            </p>
            <p className="mt-2 font-mono text-[10px] text-textMuted">
              Hi {firstName} — keep going
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<BookOpen className="h-4 w-4" />} label="Enrolled courses" value={`${stats.enrolledCourseCount}`} />
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="Lessons completed"
          value={`${stats.lessonsCompleted}`}
          hint={`of ${stats.totalLessons}`}
        />
        <StatCard icon={<Zap className="h-4 w-4" />} label="Total XP" value={gamification.xp.toLocaleString()} />
        <StatCard
          icon={<Medal className="h-4 w-4" />}
          label="Achievements"
          value={`${achievements.unlockedCount}`}
          hint={`of ${achievements.totalCount}`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-borderSubtle bg-surface p-5 shadow-card lg:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-brand">
                Course completion
              </p>
              <h3 className="mt-1 font-headline text-lg font-bold text-textPrimary">
                Overall learning progress
              </h3>
            </div>
            <span className="font-mono text-2xl font-black text-brand">{completionPct}%</span>
          </div>
          <ProgressBar value={completionPct} size="lg" />
          <p className="mt-3 text-sm text-textSecondary">
            {stats.lessonsCompleted} of {stats.totalLessons} lessons completed across your enrolled
            courses.
          </p>

          <div className="mt-6 border-t border-borderSubtle pt-5">
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-textMuted">
              Level progress
            </p>
            <XpBar xp={gamification.xp} />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-2xl border border-borderSubtle bg-surface p-5 shadow-card">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-brand">
              Consistency
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-borderSubtle bg-elevated/80 px-3 py-3">
                <p className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-textMuted">
                  <Flame className="h-3.5 w-3.5 text-brand" />
                  Streak
                </p>
                <p className="mt-1.5 font-mono text-2xl font-black text-textPrimary">
                  {gamification.streak}
                  <span className="ml-1 text-xs font-semibold text-textMuted">days</span>
                </p>
              </div>
              <div className="rounded-xl border border-borderSubtle bg-elevated/80 px-3 py-3">
                <p className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-textMuted">
                  <Zap className="h-3.5 w-3.5 text-brand" />
                  Best
                </p>
                <p className="mt-1.5 font-mono text-2xl font-black text-textPrimary">
                  {gamification.longestStreak}
                  <span className="ml-1 text-xs font-semibold text-textMuted">days</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-borderSubtle bg-surface p-5 shadow-card">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-brand">
              Quick links
            </p>
            <div className="mt-3 space-y-1.5">
              <QuickLink href={ROUTES.STUDENT.COURSES} icon={<BookOpen className="h-4 w-4" />} label="My courses" />
              <QuickLink href={ROUTES.STUDENT.ACHIEVEMENTS} icon={<Medal className="h-4 w-4" />} label="Achievements" />
              <QuickLink href={ROUTES.STUDENT.LEADERBOARD} icon={<Trophy className="h-4 w-4" />} label="Leaderboard" />
              <QuickLink href={ROUTES.STUDENT.ANALYTICS} icon={<ChartColumn className="h-4 w-4" />} label="Analytics" />
            </div>
          </div>
        </div>
      </section>

      {/* Settings */}
      <section className="rounded-2xl border border-borderSubtle bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand-subtle text-brand">
            <Settings2 className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-brand">
              Account settings
            </p>
            <h3 className="font-headline text-lg font-bold text-textPrimary">
              Profile & preferences
            </h3>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-textMuted">
              Display name
            </span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={80}
              className="mt-1.5 w-full rounded-lg border border-borderSubtle bg-elevated px-3 py-2.5 text-sm text-textPrimary outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-textMuted">
              Email
            </span>
            <input
              value={email}
              disabled
              className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-borderSubtle bg-overlay-subtle px-3 py-2.5 text-sm text-textMuted"
            />
            <span className="mt-1 block text-[11px] text-textMuted">
              Email is managed by your Alvest account.
            </span>
          </label>

          <label className="block">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-textMuted">
              Preferred course (leaderboard & dashboard)
            </span>
            <select
              value={preferredCourseId}
              onChange={(event) => setPreferredCourseId(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-borderSubtle bg-elevated px-3 py-2.5 text-sm text-textPrimary outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20"
            >
              {enrolledCourses.length === 0 ? (
                <option value="">No enrolled courses</option>
              ) : (
                enrolledCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="block">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-textMuted">
              Weekly lesson goal
            </span>
            <select
              value={weeklyGoalLessons}
              onChange={(event) => setWeeklyGoalLessons(Number(event.target.value))}
              className="mt-1.5 w-full rounded-lg border border-borderSubtle bg-elevated px-3 py-2.5 text-sm text-textPrimary outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20"
            >
              {[1, 2, 3, 5, 7, 10].map((n) => (
                <option key={n} value={n}>
                  {n} lesson{n === 1 ? "" : "s"} / week
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ToggleRow
            label="Email learning digest"
            description="Weekly summary of progress and next lessons"
            checked={emailDigest}
            onChange={setEmailDigest}
          />
          <ToggleRow
            label="Appear on leaderboard"
            description="Show your name and rank to other learners"
            checked={showOnLeaderboard}
            onChange={setShowOnLeaderboard}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-borderSubtle pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-[1.25rem] text-sm">
            {settingsMessage ? (
              <p className="inline-flex items-center gap-1.5 text-brand">
                <Check className="h-4 w-4" />
                {settingsMessage}
              </p>
            ) : null}
            {settingsError || saveError ? (
              <p className="text-amber-600 dark:text-amber-300">{settingsError || saveError}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void handleSaveSettings()}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground transition hover:bg-brandHover disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save settings
          </button>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-borderSubtle bg-surface p-4 shadow-card transition hover:border-brand/30">
      <div className="flex items-center gap-2 text-brand">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand/20 bg-brand-subtle">
          {icon}
        </span>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-textMuted">{label}</p>
      </div>
      <p className="mt-3 font-mono text-3xl font-black leading-none tracking-tight text-textPrimary">
        {value}
        {hint ? <span className="ml-1.5 text-sm font-semibold text-textMuted">{hint}</span> : null}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-textSecondary transition",
        "hover:border-borderSubtle hover:bg-elevated hover:text-textPrimary",
      )}
    >
      <span className="text-brand">{icon}</span>
      <span className="flex-1 font-medium">{label}</span>
      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-start justify-between gap-4 rounded-xl border border-borderSubtle bg-elevated/70 px-4 py-3 text-left transition hover:border-brand/30"
    >
      <div>
        <p className="text-sm font-semibold text-textPrimary">{label}</p>
        <p className="mt-0.5 text-xs text-textMuted">{description}</p>
      </div>
      <span
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-brand" : "bg-overlay-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-5" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-9 w-56" />
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
