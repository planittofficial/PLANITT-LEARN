"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { StudentLogo } from "@/components/layout/student/StudentNav";
import { StudentUserMenu } from "@/components/layout/student/StudentUserMenu";
import { NotificationBell } from "@/features/notifications";
import { GlobalSearch } from "@/features/search";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";

export function StudentHeader() {
  const { isAuthenticated, authReady, user, logout, isAdmin } = useAuth();

  return (
    <header className="fixed top-0 right-0 z-40 h-16 w-full border-b border-borderSubtle bg-surface/90 backdrop-blur-xl transition-colors md:left-64 md:w-[calc(100%-16rem)]">
      <div className="flex h-full items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="md:hidden">
            <StudentLogo />
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-semibold text-textPrimary">Continue learning</p>
            <p className="truncate text-xs text-textMuted">Pick up where you left off</p>
          </div>
        </div>

        <div className="mx-2 hidden max-w-md flex-1 md:flex lg:mx-8">
          <GlobalSearch className="w-full" />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <GlobalSearch className="md:hidden" compact />

          <ThemeToggle className="rounded-lg border border-borderSubtle bg-surface hover:border-brand/40" />
          {authReady && isAuthenticated && <NotificationBell />}

          {authReady && isAuthenticated ? (
            <StudentUserMenu
              name={user?.name ?? "Learner"}
              email={user?.email}
              isAdmin={isAdmin}
              onLogout={logout}
            />
          ) : null}

          {authReady && !isAuthenticated ? (
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brandForeground shadow-card transition hover:bg-brandHover"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
