"use client";

import { MyCoursesSection } from "@/features/student-dashboard";
import { LandingView } from "@/components/shared";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { DashboardSkeleton } from "@/components/ui/skeletons";

export default function HomePage() {
  const { isAuthenticated, devPreview, loading } = useEnrollment();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const showDashboard = isAuthenticated || devPreview;

  if (!showDashboard) {
    return <LandingView />;
  }

  return (
    <>
      <MyCoursesSection />
      <p className="mt-12 text-center text-xs text-textMuted">
        Educational content only — not investment advice. Always perform your own due diligence.
      </p>
    </>
  );
}

