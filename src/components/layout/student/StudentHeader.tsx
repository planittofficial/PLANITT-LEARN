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
    <header className="fixed top-0 right-0 w-full md:left-64 md:w-[calc(100%-16rem)] h-16 z-40 border-b border-borderSubtle bg-surface/80 backdrop-blur-xl transition-colors">
      <div className="flex h-full items-center justify-between gap-2 px-4 sm:px-6">
        
        {/* Left Section: Branding on Mobile / Navigation Status on Desktop */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <StudentLogo />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-brand uppercase">
              STUDENT_LEARNING_SPACE
            </span>
          </div>
        </div>

        {/* Center Section: Global Search (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 max-w-xs mx-8">
          <GlobalSearch className="w-full" />
        </div>

        {/* Right Section: Core Action Buttons & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <GlobalSearch className="md:hidden" compact />

          <ThemeToggle className="rounded-lg border border-borderSubtle/60 bg-surface/60 hover:border-brand/40 shadow-sm" />
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
              className="rounded-lg bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-brandForeground shadow-card transition hover:bg-brandHover active:scale-95"
            >
              Sign In
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
