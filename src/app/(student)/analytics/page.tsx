"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { LearnShell } from "@/components/layout/student";
import { AnalyticsPageSkeleton } from "@/components/ui/skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { StudentAnalyticsView } from "@/features/student-analytics";
import { useAuth } from "@/context/auth-context";

export default function AnalyticsPage() {
  const { isAuthenticated, authReady } = useAuth();

  if (!authReady) {
    return (
      <LearnShell>
        <AnalyticsPageSkeleton />
      </LearnShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <LearnShell>
        <EmptyState
          title="Sign in to view analytics"
          description="Your learning stats, weekly activity, and rank appear here after you sign in."
          icon={BarChart3}
          action={
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-black"
            >
              Sign in →
            </Link>
          }
        />
      </LearnShell>
    );
  }

  return (
    <LearnShell>
      <StudentAnalyticsView />
    </LearnShell>
  );
}
