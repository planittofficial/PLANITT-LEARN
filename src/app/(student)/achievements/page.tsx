"use client";

import Link from "next/link";
import { Award } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { AchievementsPageSkeleton } from "@/components/ui/skeletons";
import { ROUTES } from "@/constants/routes";
import { AchievementsView } from "@/features/achievements";
import { useAuth } from "@/context/auth-context";

export default function AchievementsPage() {
  const { isAuthenticated, authReady } = useAuth();

  if (!authReady) return <AchievementsPageSkeleton />;

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to view achievements"
        description="Earn badges for streaks, lessons, and course milestones after you sign in."
        icon={Award}
        action={
          <Link
            href={ROUTES.STUDENT.LOGIN}
            className="inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground transition hover:bg-brandHover dark:text-black dark:hover:brightness-110"
          >
            Sign in →
          </Link>
        }
      />
    );
  }

  return <AchievementsView />;
}
