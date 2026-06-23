"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  StudentHeaderNav,
  StudentLogo,
  StudentNav,
} from "@/components/layout/student/StudentNav";
import { StudentUserMenu } from "@/components/layout/student/StudentUserMenu";
import { NotificationBell } from "@/features/notifications";
import { GlobalSearch } from "@/features/search";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";

export function StudentHeader() {
  const { isAuthenticated, authReady, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-borderSubtle bg-surface shadow-sm shadow-black/[0.04] dark:shadow-none">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
        {/* Brand */}
        <StudentLogo />

        {/* Primary nav — desktop */}
        <StudentHeaderNav className="hidden min-w-0 flex-1 md:flex" />

        {/* Utilities */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <GlobalSearch className="md:hidden" compact />
          <GlobalSearch className="hidden w-[10.5rem] shrink-0 md:flex lg:w-[12.5rem]" />

          <div
            className="mx-0.5 hidden h-5 w-px bg-borderSubtle md:block"
            aria-hidden
          />

          <ThemeToggle />

          {authReady && isAuthenticated ? (
            <>
              <NotificationBell />
              <StudentUserMenu
                name={user?.name ?? "Learner"}
                email={user?.email}
                onLogout={logout}
              />
            </>
          ) : null}

          {authReady && !isAuthenticated ? (
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="ml-1 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-black shadow-sm transition hover:brightness-110 sm:text-sm"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
