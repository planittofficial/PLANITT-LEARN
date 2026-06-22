"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { LearnShell } from "@/components/layout/student";
import { NotificationsPageSkeleton } from "@/components/ui/skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { NotificationsView } from "@/features/notifications";
import { useAuth } from "@/context/auth-context";

export default function NotificationsPage() {
  const { isAuthenticated, authReady } = useAuth();

  if (!authReady) {
    return (
      <LearnShell>
        <NotificationsPageSkeleton />
      </LearnShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <LearnShell>
        <EmptyState
          title="Sign in to view notifications"
          description="Your achievements, streaks, and learning updates appear here after you sign in."
          icon={Bell}
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
      <NotificationsView />
    </LearnShell>
  );
}
