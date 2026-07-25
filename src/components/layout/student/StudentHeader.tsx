"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  StudentHeaderNav,
  StudentLogo,
} from "@/components/layout/student/StudentNav";
import { StudentUserMenu } from "@/components/layout/student/StudentUserMenu";
import { NotificationBell } from "@/features/notifications";
import { GlobalSearch } from "@/features/search";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";

export function StudentHeader() {
  const { isAuthenticated, authReady, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-borderSubtle bg-surface/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-stretch px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-stretch gap-4 lg:gap-5">
          <div className="flex items-center">
            <StudentLogo />
          </div>
          <div className="hidden w-px self-center bg-borderSubtle md:block md:h-5" aria-hidden />
          <StudentHeaderNav className="hidden md:flex" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center px-2 sm:px-4 lg:px-8">
          <GlobalSearch className="hidden w-full max-w-[220px] md:flex lg:max-w-[260px] xl:max-w-[300px]" />
        </div>

        <div className="flex shrink-0 items-center gap-1 self-center sm:gap-1.5">
          <GlobalSearch className="md:hidden" compact />

          <div className="hidden h-5 w-px bg-borderSubtle sm:block" aria-hidden />

          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            {authReady && isAuthenticated ? <NotificationBell /> : null}
          </div>

          {authReady && isAuthenticated ? (
            <StudentUserMenu
              name={user?.name ?? "Learner"}
              email={user?.email}
              onLogout={logout}
            />
          ) : null}

          {authReady && !isAuthenticated ? (
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="ml-1 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-brandForeground shadow-sm transition hover:bg-brandHover sm:text-sm"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
