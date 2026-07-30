"use client";

import { MyCoursesSection } from "@/features/student-dashboard";
import { LandingView } from "@/components/shared";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { DashboardSkeleton } from "@/components/ui/skeletons";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";

export default function HomePage() {
  const { isAuthenticated, devPreview, loading } = useEnrollment();
  const { isAdmin, authReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authReady && isAuthenticated && isAdmin) {
      const mode = typeof window !== "undefined" ? localStorage.getItem("lms-view-mode") : null;
      if (mode !== "student") {
        router.replace(ROUTES.ADMIN.HOME);
      }
    }
  }, [authReady, isAuthenticated, isAdmin, router]);

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

