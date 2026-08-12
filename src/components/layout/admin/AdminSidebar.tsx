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
  LineChart,
  LogOut,
  Sliders,
} from "lucide-react";

import { AlvestLogo } from "@/components/brand";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ROUTES } from "@/constants/routes";
import { setLmsViewMode } from "@/lib/auth/view-mode";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

const NAV_ITEMS = [
  { href: ROUTES.ADMIN.HOME, label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: ROUTES.ADMIN.COURSES, label: "Courses", icon: BookOpen, exact: false },
  { href: ROUTES.ADMIN.STUDENTS, label: "Learners", icon: Users, exact: false },
  { href: ROUTES.ADMIN.ANALYTICS, label: "Analytics", icon: BarChart3, exact: false },
  { href: ROUTES.ADMIN.LEADERBOARD, label: "Leaderboard", icon: Trophy, exact: false },
] as const;

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const content = (
    <div className="flex flex-col h-full bg-surface border-r border-borderSubtle">
      {/* Header Logo */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-borderSubtle">
        <Link href={ROUTES.ADMIN.HOME} className="flex items-center gap-3" onClick={onMobileClose}>
          <AlvestLogo variant="markClear" size={36} priority className="drop-shadow-sm" />
          <div>
            <span className="font-headline text-lg font-bold text-textPrimary tracking-tight">
              Alvest <span className="text-brand">Learn</span>
            </span>
            <p className="text-xs text-textMuted mt-0.5">Admin workspace</p>
          </div>
        </Link>
        {onMobileClose ? (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-textMuted hover:bg-overlay-hover lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition border border-transparent",
                active
                  ? "bg-brand/10 border-l-2 border-l-brand text-brand font-semibold"
                  : "text-textSecondary hover:bg-overlay-hover hover:text-textPrimary",
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-brand" : "")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer widgets */}
      <div className="p-4 border-t border-borderSubtle space-y-4">
        {/* User Block */}
        {user ? (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-overlay-subtle border border-borderSubtle">
            <div className="h-8 w-8 rounded-lg bg-brand/10 border border-brand/30 flex items-center justify-center font-bold text-xs text-brand uppercase">
              {user.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-textPrimary truncate">{user.name}</p>
              <p className="text-[10px] text-brand font-semibold tracking-wide mt-0.5">Platform admin</p>
            </div>
          </div>
        ) : null}

        {/* Theme Settings Widget */}
        <div className="flex items-center justify-between rounded-lg border border-borderSubtle bg-transparent px-3 py-2 text-xs text-textMuted">
          <span>Theme Mode</span>
          <ThemeToggle showLabel={false} />
        </div>

        {/* Links to portals */}
        <div className="flex flex-col gap-2 text-xs">
          <Link
            href={ROUTES.STUDENT.HOME}
            onClick={() => {
              setLmsViewMode("student");
              onMobileClose?.();
            }}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-borderSubtle py-2.5 text-textSecondary hover:border-brand/40 hover:text-brand transition"
          >
            ← Student Portal
          </Link>
          {user ? (
            <button
              onClick={() => void logout()}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2.5 text-red-600 hover:border-red-300 hover:bg-red-50 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              Disconnect
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col lg:flex">
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
