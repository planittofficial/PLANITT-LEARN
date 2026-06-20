"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { planittCheckoutUrl } from "@/constants/urls";
import { useAuth } from "@/context/auth-context";
import { ROUTES } from "@/constants/routes";
import { StudentLogo, StudentNav } from "@/components/layout/student/StudentNav";

export function LearnShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authReady, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.STUDENT.LOGIN);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-borderSubtle bg-base/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <StudentLogo />
          <StudentNav />
          <div className="flex items-center gap-3 text-sm text-textSecondary">
            <a
              href={planittCheckoutUrl()}
              className="hidden lg:inline text-xs hover:text-brand"
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy courses
            </a>
            {authReady && isAuthenticated ? (
              <>
                <span className="hidden max-w-[120px] truncate text-xs lg:inline">
                  {user?.name ?? user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs hover:bg-white/5 hover:text-textPrimary"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </>
            ) : authReady ? (
              <Link
                href={ROUTES.STUDENT.LOGIN}
                className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20"
              >
                Sign in
              </Link>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
