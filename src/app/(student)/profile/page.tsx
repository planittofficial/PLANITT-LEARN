"use client";

import { LearnShell } from "@/components/layout/student";
import { EmptyState } from "@/components/shared";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/hooks/profile/use-profile";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function ProfilePage() {
  const { isAuthenticated, authReady, user } = useAuth();
  const { profile, isLoading } = useProfile();

  if (!authReady) {
    return (
      <LearnShell>
        <p className="text-sm text-textSecondary">Loading profile…</p>
      </LearnShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <LearnShell>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-4 text-sm text-textSecondary">
          <Link href={ROUTES.STUDENT.LOGIN} className="text-brand hover:underline">
            Sign in
          </Link>{" "}
          to view your learning stats.
        </p>
      </LearnShell>
    );
  }

  const stats = profile?.stats;
  const completionPct =
    stats && stats.totalLessons > 0
      ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100)
      : 0;

  return (
    <LearnShell>
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-2 text-sm text-textSecondary">Your Planitt Learn account</p>

      {isLoading ? (
        <p className="mt-6 text-sm text-textSecondary">Loading stats…</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-borderSubtle bg-surface p-5">
            <p className="text-xs uppercase tracking-wide text-textMuted">Name</p>
            <p className="mt-1 text-lg font-semibold">{profile?.user.name ?? user?.name}</p>
            <p className="mt-1 text-sm text-textSecondary">{profile?.user.email ?? user?.email}</p>
          </div>

          <div className="rounded-xl border border-borderSubtle bg-surface p-5">
            <p className="text-xs uppercase tracking-wide text-textMuted">Enrolled courses</p>
            <p className="mt-1 text-3xl font-bold text-brand">
              {stats?.enrolledCourseCount ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-borderSubtle bg-surface p-5 sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-textMuted">Overall progress</p>
            <p className="mt-1 text-lg font-semibold">
              {stats?.lessonsCompleted ?? 0} / {stats?.totalLessons ?? 0} lessons completed
              {stats && stats.totalLessons > 0 ? ` (${completionPct}%)` : ""}
            </p>
            {stats && stats.totalLessons > 0 ? (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-borderSubtle">
                <div
                  className="h-full bg-brand transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            ) : null}
          </div>
        </div>
      )}

      {!isLoading && !profile ? (
        <div className="mt-6">
          <EmptyState
            title="Could not load profile"
            description="Try refreshing the page or signing in again."
          />
        </div>
      ) : null}
    </LearnShell>
  );
}
