"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  Home,
  Trophy,
  User,
  LogOut,
  LineChart,
  BookOpen,
} from "lucide-react";

import { AlvestLogo } from "@/components/brand";
import { ROUTES } from "@/constants/routes";
import { setLmsViewMode } from "@/lib/auth/view-mode";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Avatar } from "@/components/ui/Avatar";

export const STUDENT_NAV_ITEMS = [
  { href: ROUTES.STUDENT.HOME, label: "My Learning", shortLabel: "Learn", icon: Home },
  { href: ROUTES.STUDENT.ANALYTICS, label: "Progress", shortLabel: "Progress", icon: BarChart3 },
  { href: ROUTES.STUDENT.ACHIEVEMENTS, label: "Achievements", shortLabel: "Badges", icon: Award },
  { href: ROUTES.STUDENT.PROFILE, label: "Profile", shortLabel: "Profile", icon: User },
] as const;

export const STUDENT_HEADER_NAV_ITEMS = [
  ...STUDENT_NAV_ITEMS.filter((item) => item.href !== ROUTES.STUDENT.PROFILE),
  { href: ROUTES.STUDENT.LEADERBOARD, label: "Leaderboard", shortLabel: "Rank", icon: Trophy },
] as const;

type StudentHeaderNavProps = {
  className?: string;
};

export function StudentHeaderNav({ className }: StudentHeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("items-stretch", className)} aria-label="Main">
      <div className="-mb-px flex h-full items-stretch gap-0.5">
        {STUDENT_HEADER_NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "relative inline-flex h-full shrink-0 items-center gap-2 border-b-2 px-2.5 text-sm font-medium transition-colors sm:px-3",
                active
                  ? "border-brand text-brand"
                  : "border-transparent text-textSecondary hover:border-borderSubtle hover:text-textPrimary",
              )}
            >
              <item.icon
                className={cn("h-4 w-4 shrink-0", active && "text-brand")}
                strokeWidth={active ? 2.25 : 2}
              />
              <span className="hidden whitespace-nowrap lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function StudentNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-borderSubtle bg-surface/95 backdrop-blur-md md:hidden"
      aria-label="Main"
    >
      <div className="mx-auto flex h-16 items-stretch px-2">
        {STUDENT_NAV_ITEMS.map((item) => {
          const active =
            item.href === ROUTES.STUDENT.HOME
              ? pathname === item.href || pathname.startsWith("/courses")
              : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition",
                active ? "text-brand" : "text-textMuted",
              )}
            >
              {active ? (
                <span
                  className="absolute left-1/2 top-0 h-0.5 w-10 -translate-x-1/2 rounded-full bg-brand"
                  aria-hidden
                />
              ) : null}
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 2} />
              <span className="max-w-full truncate leading-none">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

type StudentLogoProps = {
  className?: string;
};

export function StudentLogo({ className }: StudentLogoProps) {
  return (
    <Link
      href={ROUTES.STUDENT.HOME}
      className={cn("inline-flex shrink-0 items-center gap-3 transition hover:opacity-90", className)}
    >
      <AlvestLogo variant="markClear" size={36} priority className="drop-shadow-sm" />
      <span className="hidden font-headline text-lg font-bold tracking-tight text-textPrimary md:inline">
        Alvest <span className="text-brand">Learn</span>
      </span>
    </Link>
  );
}

export function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const sidebarItems = [
    {
      href: ROUTES.STUDENT.HOME,
      label: "My learning",
      icon: Home,
      matches: (p: string) => p === ROUTES.STUDENT.HOME,
    },
    {
      href: ROUTES.STUDENT.COURSES,
      label: "Courses",
      icon: BookOpen,
      matches: (p: string) => p.startsWith("/courses"),
    },
    { href: ROUTES.STUDENT.LEADERBOARD, label: "Leaderboard", icon: Trophy },
    { href: ROUTES.STUDENT.ACHIEVEMENTS, label: "Achievements", icon: Award },
    { href: ROUTES.STUDENT.ANALYTICS, label: "Progress", icon: BarChart3 },
    { href: ROUTES.STUDENT.PROFILE, label: "Profile", icon: User },
    ...(isAdmin ? [{ href: ROUTES.ADMIN.HOME, label: "Admin", icon: LineChart }] : []),
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-borderSubtle bg-surface p-5 transition-colors md:flex">
      <div className="mb-8 flex items-center gap-3">
        <AlvestLogo variant="markClear" size={36} priority className="drop-shadow-sm" />
        <span className="font-headline text-lg font-bold tracking-tight text-textPrimary">
          Alvest <span className="text-brand">Learn</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {sidebarItems.map((item) => {
          const active = "matches" in item && item.matches
            ? item.matches(pathname)
            : pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => {
                if (item.href === ROUTES.ADMIN.HOME) {
                  setLmsViewMode("admin");
                }
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-textSecondary hover:bg-overlay-hover hover:text-textPrimary",
              )}
            >
              <item.icon
                className={cn("h-4 w-4 shrink-0", active ? "text-brand" : "text-textMuted")}
                strokeWidth={active ? 2.5 : 2}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-borderSubtle pt-4">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 rounded-xl border border-borderSubtle bg-elevated/60 p-2.5">
            <Avatar name={user.name ?? "Learner"} className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-textPrimary">{user.name}</p>
              <p className="text-xs text-textMuted">Learner</p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              title="Sign out"
              className="rounded-lg p-1.5 text-textMuted transition hover:bg-overlay-hover hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
