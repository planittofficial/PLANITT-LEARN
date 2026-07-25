"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { AlvestLogo } from "@/components/brand";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: ROUTES.ADMIN.HOME, label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: ROUTES.ADMIN.COURSES, label: "Courses", icon: BookOpen, exact: false },
  { href: ROUTES.ADMIN.STUDENTS, label: "Students", icon: Users, exact: false },
  { href: ROUTES.ADMIN.ANALYTICS, label: "Analytics", icon: BarChart3, exact: false },
  { href: ROUTES.ADMIN.LEADERBOARD, label: "Leaderboard", icon: Trophy, exact: false },
] as const;

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const content = (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-borderSubtle px-5 py-5">
        <Link href={ROUTES.ADMIN.HOME} className="flex items-center gap-3" onClick={onMobileClose}>
          <AlvestLogo variant="mark" size={40} className="shadow-sm" />
          <div>
            <p className="font-semibold text-textPrimary">
              Alvest <span className="text-brand">Console</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-textMuted">Admin panel</p>
          </div>
        </Link>
        {onMobileClose ? (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-2 text-textMuted hover:bg-overlay-hover lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand/15 text-brand shadow-sm shadow-brand/20 ring-1 ring-brand/15"
                  : "text-textSecondary hover:bg-overlay-hover hover:text-textPrimary",
              )}
            >
              <item.icon className={cn("h-4 w-4", active ? "text-brand" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-borderSubtle p-4 space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-borderSubtle bg-overlay-subtle px-3 py-2">
          <span className="text-xs text-textMuted">Theme</span>
          <ThemeToggle showLabel />
        </div>
        <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-textMuted">
          Quick tip
        </p>
        <p className="rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 text-xs leading-relaxed text-textMuted">
          Upload videos from <strong className="text-brand">Courses → Module → Lesson</strong>{" "}
          editor.
        </p>
        <Link
          href={ROUTES.STUDENT.HOME}
          onClick={onMobileClose}
          className="mt-3 flex items-center justify-center rounded-xl border border-borderSubtle px-3 py-2.5 text-xs font-medium text-textSecondary transition hover:border-brand/30 hover:text-brand"
        >
          ← Student portal
        </Link>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-borderSubtle bg-surface/50 lg:flex">
        {content}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-label="Close menu overlay"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-surface shadow-2xl">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
