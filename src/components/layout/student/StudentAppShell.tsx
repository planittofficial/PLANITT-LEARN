"use client";

import { usePathname } from "next/navigation";

import { LearnShell } from "@/components/layout/student/LearnShell";
import { ROUTES } from "@/constants/routes";

export function StudentAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === ROUTES.STUDENT.LOGIN) {
    return <>{children}</>;
  }

  return <LearnShell>{children}</LearnShell>;
}
