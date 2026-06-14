"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-borderSubtle bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 text-sm">
          <Link href={ROUTES.ADMIN.HOME} className="font-semibold text-brand">
            Planitt Admin
          </Link>
          <Link href={ROUTES.ADMIN.COURSES} className="text-textSecondary hover:text-textPrimary">
            Courses
          </Link>
          <Link href={ROUTES.ADMIN.STUDENTS} className="text-textSecondary hover:text-textPrimary">
            Students
          </Link>
          <Link href={ROUTES.STUDENT.HOME} className="ml-auto text-textMuted hover:text-brand">
            ← Student portal
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
