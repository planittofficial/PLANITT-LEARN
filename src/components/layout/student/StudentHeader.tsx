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

function StockTicker() {
  const items = [
    { name: "$PLANITT", change: "+24.8% 🚀", isUp: true },
    { name: "$STREAK", change: "+150% 🔥", isUp: true },
    { name: "$XP_INDEX", change: "+920 ⚡", isUp: true },
    { name: "$FOREX", change: "BULLISH 💱", isUp: true },
    { name: "$INDIAN_STOCKS", change: "+12.4% 📈", isUp: true },
    { name: "$CRYPTO", change: "MOONING ₿", isUp: true },
    { name: "$FNO_VOL", change: "HIGH 📊", isUp: true },
    { name: "$ALGO_ALPHA", change: "+4.2% 🤖", isUp: true },
    { name: "$PSYCH_CONTROL", change: "100% 🧠", isUp: true },
  ];

  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="ticker-wrap select-none">
      <div className="ticker">
        {tickerItems.map((item, index) => (
          <span key={index} className="ticker-item">
            <span className="font-bold text-textPrimary">{item.name}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {item.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function StudentHeader() {
  const { isAuthenticated, authReady, user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 w-full shadow-sm">
      <header className="border-b border-borderSubtle bg-surface/95 backdrop-blur-md dark:shadow-none">
        <div className="mx-auto flex h-14 max-w-7xl items-stretch px-4 sm:h-16 sm:px-6 lg:px-8">
          {/* Brand + primary navigation */}
          <div className="flex min-w-0 shrink-0 items-stretch gap-4 lg:gap-5">
            <div className="flex items-center">
              <StudentLogo />
            </div>
            <div className="hidden w-px self-center bg-borderSubtle md:block md:h-5" aria-hidden />
            <StudentHeaderNav className="hidden md:flex" />
          </div>

          {/* Centered search — Coursera / Udemy style */}
          <div className="flex min-w-0 flex-1 items-center justify-center px-2 sm:px-4 lg:px-8">
            <GlobalSearch className="hidden w-full max-w-[220px] md:flex lg:max-w-[260px] xl:max-w-[300px]" />
          </div>

          {/* Account utilities */}
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
                className="ml-1 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-black shadow-sm transition hover:brightness-110 sm:text-sm"
              >
                Sign in
              </Link>
            ) : null}
          </div>
        </div>
      </header>
      <StockTicker />
    </div>
  );
}
