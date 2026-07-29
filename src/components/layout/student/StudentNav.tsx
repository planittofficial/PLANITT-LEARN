"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  Home,
  Trophy,
  User,
} from "lucide-react";

import { AlvestLogo } from "@/components/brand";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-borderSubtle bg-surface/80 backdrop-blur-md md:hidden"
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
      className={cn(
        "inline-flex shrink-0 items-center gap-2 transition hover:opacity-90",
        className,
      )}
    >
      <AlvestLogo variant="mark" size={32} className="shadow-sm ring-1 ring-black/10 dark:ring-white/10" />
      <span className="hidden whitespace-nowrap text-lg font-headline font-bold tracking-tight text-brand uppercase md:inline">
        ALVEST<span className="text-textPrimary">_</span>LEARN
      </span>
    </Link>
  );
}

export function StudentSidebar() {
  const pathname = usePathname();

  const sidebarItems = [
    { href: ROUTES.STUDENT.HOME, label: "COMMAND_CENTER", icon: Home },
    { href: "/courses", label: "CURRICULUM", icon: BarChart3, matches: (p: string) => p.startsWith("/courses") || p === ROUTES.STUDENT.HOME },
    { href: ROUTES.STUDENT.LEADERBOARD, label: "LEADERBOARD", icon: Trophy },
    { href: ROUTES.STUDENT.ACHIEVEMENTS, label: "ACHIEVEMENTS", icon: Award },
    { href: ROUTES.STUDENT.PROFILE, label: "SETTINGS", icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col p-6 pt-24 h-screen w-64 fixed left-0 top-0 z-40 bg-surface border-r border-borderSubtle">
      <nav className="flex flex-col gap-1.5">
        {sidebarItems.map((item) => {
          const active = item.matches ? item.matches(pathname) : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded font-mono text-xs tracking-tight transition-all duration-200",
                active
                  ? "bg-brand/10 text-brand font-bold border border-brand/20"
                  : "text-textSecondary hover:text-textPrimary hover:bg-white/5 border border-transparent"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 2} />
              <span className="tracking-widest uppercase">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 pt-6 border-t border-borderSubtle/50">
        <div className="p-4 bg-elevated border border-borderSubtle rounded-lg terminal-glow">
          <p className="font-mono text-[10px] text-brand mb-2 opacity-60">SYSTEM_LOG_V2.4</p>
          <p className="font-mono text-[11px] text-textSecondary leading-relaxed">
            &gt; Status: Active<br/>
            &gt; Mode: Dev Standalone<br/>
            &gt; Delta: Connected
          </p>
        </div>
      </div>
    </aside>
  );
}
