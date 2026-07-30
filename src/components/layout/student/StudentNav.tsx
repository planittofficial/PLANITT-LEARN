"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  Home,
  Trophy,
  User,
  TrendingUp,
  LogOut,
  LineChart,
  BookOpen
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
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
                "relative inline-flex h-full shrink-0 items-center gap-2 border-b-2 px-2.5 text-xs font-mono tracking-widest uppercase transition-colors sm:px-3",
                active
                  ? "border-brand text-brand font-bold"
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-surface/80 backdrop-blur-md md:hidden"
      aria-label="Main"
    >
      <div className="mx-auto flex h-16 items-stretch px-4">
        {STUDENT_NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-mono tracking-wider transition",
                active ? "text-brand" : "text-textMuted",
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
              <span className="truncate leading-none uppercase">{item.shortLabel}</span>
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
        "inline-flex shrink-0 items-center gap-3 transition hover:opacity-90",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 border border-brand/20">
        <TrendingUp className="h-5 w-5 text-brand" />
      </div>
      <span className="hidden whitespace-nowrap text-lg font-headline font-extrabold tracking-tighter text-brand uppercase md:inline">
        TRDR<span className="text-textPrimary">_PRO</span>
      </span>
    </Link>
  );
}

export function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const sidebarItems = [
    { href: ROUTES.STUDENT.HOME, label: "COMMAND_CENTER", icon: Home },
    { 
      href: ROUTES.STUDENT.HOME, 
      label: "CURRICULUM", 
      icon: BookOpen, 
      matches: (p: string) => p.startsWith("/courses") || p === ROUTES.STUDENT.HOME 
    },
    { href: ROUTES.STUDENT.LEADERBOARD, label: "LEADERBOARD", icon: Trophy },
    { href: ROUTES.STUDENT.ACHIEVEMENTS, label: "ACHIEVEMENTS", icon: Award },
    { href: ROUTES.STUDENT.ANALYTICS, label: "ANALYTICS", icon: BarChart3 },
    { href: ROUTES.STUDENT.PROFILE, label: "SETTINGS", icon: User },
    ...(isAdmin ? [{ href: ROUTES.ADMIN.HOME, label: "ADMIN_CONSOLE", icon: LineChart }] : []),
  ];

  return (
    <aside className="hidden md:flex flex-col p-6 h-screen w-64 fixed left-0 top-0 z-40 bg-surface border-r border-white/5">
      {/* Sidebar Header Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 border border-brand/20">
          <TrendingUp className="h-5 w-5 text-brand" />
        </div>
        <span className="font-headline text-[20px] font-black text-brand tracking-tighter uppercase">
          TRDR_PRO
        </span>
      </div>

      {/* Navigation menu */}
      <nav className="flex-grow flex flex-col gap-1.5">
        {sidebarItems.map((item) => {
          const active = item.matches ? item.matches(pathname) : pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => {
                if (item.href === ROUTES.ADMIN.HOME && typeof window !== "undefined") {
                  localStorage.setItem("lms-view-mode", "admin");
                }
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded font-mono text-xs tracking-wider transition-all duration-200 border border-transparent",
                active
                  ? "bg-brand/5 text-brand font-bold border-l-2 border-l-brand"
                  : "text-textSecondary hover:text-textPrimary hover:bg-overlay-hover"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 2} />
              <span className="uppercase">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer User Info */}
      <div className="mt-auto border-t border-borderSubtle pt-6 space-y-4">
        {isAuthenticated && user && (
          <div className="flex items-center gap-3">
            <Avatar name={user.name ?? "Learner"} className="h-10 w-10 ring-1 ring-white/10" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-textPrimary truncate">{user.name}</p>
              <p className="text-[10px] text-brand/60 font-mono uppercase tracking-wider">
                TERMINAL v2.4
              </p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="text-textMuted hover:text-red-400 p-1.5 rounded hover:bg-overlay-hover transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="p-4 bg-elevated border border-borderSubtle rounded-lg terminal-glow">
          <p className="font-mono text-[9px] text-brand mb-1 opacity-60 uppercase tracking-widest">SYSTEM_LOG</p>
          <p className="font-mono text-[10px] text-textSecondary leading-relaxed">
            &gt; Status: Active<br/>
            &gt; Delta: Connected
          </p>
        </div>
      </div>
    </aside>
  );
}
