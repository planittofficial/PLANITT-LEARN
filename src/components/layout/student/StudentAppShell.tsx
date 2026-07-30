"use client";

import { usePathname } from "next/navigation";

import { LearnShell } from "@/components/layout/student/LearnShell";
import { ROUTES } from "@/constants/routes";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";

export function StudentAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, devPreview, loading } = useEnrollment();

  if (pathname === ROUTES.STUDENT.LOGIN) {
    return <>{children}</>;
  }

  if (loading) {
    return <LearnShell>{children}</LearnShell>;
  }

  const showDashboard = isAuthenticated || devPreview;

  if (!showDashboard) {
    return <>{children}</>;
  }

  return <LearnShell>{children}</LearnShell>;
}

