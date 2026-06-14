"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { MAIN_WEBSITE_URL } from "@/lib/env";

export function LearnShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authReady, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.STUDENT.LOGIN);
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-borderSubtle bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href={ROUTES.STUDENT.HOME} className="text-sm font-semibold text-brand">
            Planitt Learn
          </Link>
          <div className="flex items-center gap-4 text-sm text-textSecondary">
            <a
              href={`${MAIN_WEBSITE_URL}/learn`}
              className="hidden sm:inline hover:text-textPrimary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy courses
            </a>
            {authReady && isAuthenticated ? (
              <>
                <span className="hidden sm:inline">{user?.name ?? user?.email}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 hover:text-textPrimary"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : null}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
