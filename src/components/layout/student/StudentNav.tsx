"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Home, Trophy, User } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: ROUTES.STUDENT.HOME, label: "My Learning", icon: Home },
  { href: ROUTES.STUDENT.LEADERBOARD, label: "Leaderboard", icon: Trophy },
  { href: ROUTES.STUDENT.PROFILE, label: "Profile", icon: User },
] as const;

export function StudentNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-brand/10 font-medium text-brand"
                  : "text-textSecondary hover:bg-white/5 hover:text-textPrimary",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-borderSubtle bg-surface/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-xs transition",
                  active ? "text-brand" : "text-textMuted",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function StudentLogo() {
  return (
    <Link href={ROUTES.STUDENT.HOME} className="inline-flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15">
        <GraduationCap className="h-4 w-4 text-brand" />
      </div>
      <span className="font-semibold text-textPrimary">
        Planitt <span className="text-brand">Learn</span>
      </span>
    </Link>
  );
}
