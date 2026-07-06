"use client";

import Link from "next/link";
import { BookOpen, Mail, Target, User } from "lucide-react";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/hooks/profile/use-profile";

export default function ProfilePage() {
  const { isAuthenticated, authReady, user } = useAuth();
  const { profile, isLoading } = useProfile();

  if (!authReady) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
          title="Sign in to view profile"
          description="Your learning stats and enrolled courses appear here after you sign in."
          icon={User}
          action={
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-black"
            >
              Sign in →
            </Link>
        }
      />
    );
  }

  const stats = profile?.stats;
  const completionPct =
    stats && stats.totalLessons > 0
      ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100)
      : 0;

  return (
    <>
      <header className="mb-8">
        <div className="flex items-center gap-2 text-brand">
          <User className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">Account</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold">Your profile</h1>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-borderSubtle bg-surface p-6 sm:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/15 text-2xl font-bold text-brand">
                {(profile?.user.name ?? user?.name ?? "?")[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile?.user.name ?? user?.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-textSecondary">
                  <Mail className="h-3.5 w-3.5" />
                  {profile?.user.email ?? user?.email}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-borderSubtle bg-surface p-5">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-brand" />
              <div>
                <p className="text-xs text-textMuted">Enrolled courses</p>
                <p className="text-2xl font-bold">{stats?.enrolledCourseCount ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-borderSubtle bg-surface p-5">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-brand" />
              <div>
                <p className="text-xs text-textMuted">Lessons completed</p>
                <p className="text-2xl font-bold">
                  {stats?.lessonsCompleted ?? 0}
                  <span className="text-sm font-normal text-textMuted">
                    /{stats?.totalLessons ?? 0}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-borderSubtle bg-surface p-6 sm:col-span-2">
            <p className="mb-3 text-sm font-medium">Overall learning progress</p>
            <ProgressBar value={completionPct} showLabel size="lg" />
          </div>
        </div>
      )}

      {!isLoading && !profile ? (
        <div className="mt-6">
          <EmptyState title="Could not load profile" description="Try refreshing the page." />
        </div>
      ) : null}
    </>
  );
}
