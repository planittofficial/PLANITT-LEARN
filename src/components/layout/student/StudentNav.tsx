"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  GraduationCap,
  Home,
  LogOut,
  ShoppingBag,
  Trophy,
  User,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { planittCheckoutUrl } from "@/constants/urls";
import { cn } from "@/lib/utils";

export const STUDENT_NAV_ITEMS = [
  { href: ROUTES.STUDENT.HOME, label: "My Learning", shortLabel: "Learn", icon: Home },
  { href: ROUTES.STUDENT.ANALYTICS, label: "Analytics", shortLabel: "Stats", icon: BarChart3 },
  { href: ROUTES.STUDENT.ACHIEVEMENTS, label: "Achievements", shortLabel: "Badges", icon: Award },
  { href: ROUTES.STUDENT.LEADERBOARD, label: "Leaderboard", shortLabel: "Rank", icon: Trophy },
  { href: ROUTES.STUDENT.PROFILE, label: "Profile", shortLabel: "Profile", icon: User },
] as const;

type StudentHeaderNavProps = {
  className?: string;
};

/** Desktop inline tab navigation */
export function StudentHeaderNav({ className }: StudentHeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("items-stretch", className)} aria-label="Main">
      <div className="flex h-full min-w-0 items-stretch gap-0 overflow-x-auto">
        {STUDENT_NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative inline-flex shrink-0 items-center px-3 text-sm font-medium transition-colors lg:px-4",
                active
                  ? "text-brand"
                  : "text-textSecondary hover:text-textPrimary",
              )}
            >
              <item.icon
                className={cn(
                  "mr-0 hidden h-4 w-4 shrink-0 lg:mr-2 lg:inline",
                  active && "text-brand",
                )}
                strokeWidth={active ? 2.25 : 2}
              />
              <span className="whitespace-nowrap">{item.label}</span>
              {active ? (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand lg:inset-x-3" />
              ) : null}
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
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-black shadow-sm">
        <GraduationCap className="h-4 w-4" />
      </div>
      <span className="hidden whitespace-nowrap text-[15px] font-semibold tracking-tight text-textPrimary sm:inline">
        Planitt<span className="text-brand"> Learn</span>
      </span>
    </Link>
  );
}

/** @deprecated Use StudentHeaderNav */
export function StudentNavBar() {
  return <StudentHeaderNav className="flex" />;
}
