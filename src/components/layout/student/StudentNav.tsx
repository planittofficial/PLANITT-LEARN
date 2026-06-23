"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  GraduationCap,
  Home,
  Trophy,
  User,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export const STUDENT_NAV_ITEMS = [
  { href: ROUTES.STUDENT.HOME, label: "My Learning", shortLabel: "Learn", icon: Home },
  { href: ROUTES.STUDENT.ANALYTICS, label: "Analytics", shortLabel: "Stats", icon: BarChart3 },
  { href: ROUTES.STUDENT.ACHIEVEMENTS, label: "Achievements", shortLabel: "Badges", icon: Award },
  { href: ROUTES.STUDENT.LEADERBOARD, label: "Leaderboard", shortLabel: "Rank", icon: Trophy },
  { href: ROUTES.STUDENT.PROFILE, label: "Profile", shortLabel: "Profile", icon: User },
] as const;

/** Header tabs — Profile lives in the avatar menu to avoid crowding search. */
export const STUDENT_HEADER_NAV_ITEMS = STUDENT_NAV_ITEMS.filter(
  (item) => item.href !== ROUTES.STUDENT.PROFILE,
);

type StudentHeaderNavProps = {
  className?: string;
};

/** Desktop inline tab navigation */
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

/** Mobile bottom navigation */
export function StudentNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-borderSubtle bg-surface md:hidden"
      aria-label="Main"
    >
      <div className="mx-auto flex h-[3.25rem] max-w-lg items-stretch">
        {STUDENT_NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition",
                active ? "text-brand" : "text-textMuted",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 2} />
              <span className="truncate font-medium leading-none">{item.shortLabel}</span>
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
      className={cn("inline-flex shrink-0 items-center gap-2", className)}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-black shadow-sm ring-1 ring-black/5">
        <GraduationCap className="h-4 w-4" />
      </div>
      <span className="hidden whitespace-nowrap text-[15px] font-semibold tracking-tight text-textPrimary md:inline">
        Planitt<span className="text-brand"> Learn</span>
      </span>
    </Link>
  );
}

/** @deprecated Use StudentHeaderNav */
export function StudentNavBar() {
  return <StudentHeaderNav className="flex" />;
}
