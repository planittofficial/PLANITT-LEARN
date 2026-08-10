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
    <header className="fixed top-0 right-0 w-full md:left-64 md:w-auto h-16 z-40 border-b border-borderSubtle bg-surface/90 backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-2 px-4 sm:px-6">
        
        {/* Left Section: Branding on Mobile / Navigation Status on Desktop */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <StudentLogo />
          </div>
          <span className="hidden md:inline text-[11px] font-medium tracking-wide text-brand/90">
            Student learning space
          </span>
        </div>

        {/* Center Section: Global Search (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 max-w-xs mx-8">
          <GlobalSearch className="w-full" />
        </div>

        {/* Right Section: Core Action Buttons & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <GlobalSearch className="md:hidden" compact />

          <ThemeToggle />
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
              className="rounded bg-brand px-3 py-1.5 text-xs font-semibold tracking-wide text-black shadow-sm transition hover:bg-brand-bright"
            >
              Sign In
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
