"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { StudentLogo } from "@/components/layout/student/StudentNav";
import { StudentUserMenu } from "@/components/layout/student/StudentUserMenu";
import { NotificationBell } from "@/features/notifications";
import { GlobalSearch } from "@/features/search";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";

export function StudentHeader() {
  const { isAuthenticated, authReady, user, logout } = useAuth();

  return (
    <header className="fixed top-0 right-0 w-full md:left-64 md:w-auto h-16 z-40 border-b border-white/5 bg-surface/60 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-6">
        
        {/* Left Section: Branding on Mobile / Navigation Status on Desktop */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <StudentLogo />
          </div>
          <span className="hidden md:inline font-mono text-[10px] tracking-widest text-brand uppercase font-bold">
            QUANTUM_LMS // TERMINAL
          </span>
        </div>

        {/* Center Section: Global Search (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 max-w-xs mx-8">
          <GlobalSearch className="w-full" />
        </div>

        {/* Right Section: Core Action Buttons & User Menu */}
        <div className="flex items-center gap-3">
          <GlobalSearch className="md:hidden" compact />

          {/* Quick Info & Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 border border-white/5 font-mono text-[10px] text-textSecondary">
              <Wallet className="h-3 w-3 text-brand" />
              <span>$10,000 MOCK</span>
            </div>
            <button className="bg-brand text-black font-mono font-bold text-[10px] tracking-wider px-3 py-1 rounded hover:brightness-110 active:scale-95 transition-all">
              GO LIVE
            </button>
          </div>

          <ThemeToggle />
          {authReady && isAuthenticated && <NotificationBell />}

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
              className="rounded bg-brand px-3 py-1.5 text-xs font-mono tracking-widest uppercase font-bold text-black shadow-sm transition hover:bg-brand-bright"
            >
              Sign In
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
