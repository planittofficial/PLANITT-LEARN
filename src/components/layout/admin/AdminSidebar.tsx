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
  Terminal
} from "lucide-react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

const NAV_ITEMS = [
  { href: ROUTES.ADMIN.HOME, label: "PLATFORM_DASHBOARD", icon: LayoutDashboard, exact: true },
  { href: ROUTES.ADMIN.COURSES, label: "COURSE_MANAGEMENT", icon: BookOpen, exact: false },
  { href: ROUTES.ADMIN.STUDENTS, label: "STUDENT_ROSTER", icon: Users, exact: false },
  { href: ROUTES.ADMIN.ANALYTICS, label: "PLATFORM_ANALYTICS", icon: BarChart3, exact: false },
  { href: ROUTES.ADMIN.LEADERBOARD, label: "LEADERBOARD_STATUS", icon: Trophy, exact: false },
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
    <div className="flex flex-col h-full bg-[#131313]/90 backdrop-blur-md border-r border-white/5">
      {/* Header Logo */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-white/5">
        <Link href={ROUTES.ADMIN.HOME} className="flex items-center gap-3" onClick={onMobileClose}>
          <div className="flex h-10 w-10 items-center justify-center rounded bg-brand/10 border border-brand/20">
            <Terminal className="h-5 w-5 text-brand" />
          </div>
          <div>
            <span className="font-headline text-lg font-black text-brand tracking-tighter uppercase">
              TRDR<span className="text-textPrimary">_ADMIN</span>
            </span>
            <p className="text-[9px] font-mono uppercase tracking-widest text-textMuted mt-0.5">Control Panel</p>
          </div>
        </Link>
        {onMobileClose ? (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded p-1.5 text-textMuted hover:bg-white/5 lg:hidden"
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
                "flex items-center gap-3 rounded px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider transition border border-transparent",
                active
                  ? "bg-brand/5 border-l-2 border-l-brand text-brand font-bold"
                  : "text-textSecondary hover:bg-white/5 hover:text-textPrimary",
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-brand" : "")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer widgets */}
      <div className="p-4 border-t border-white/5 space-y-4">
        {/* User Block */}
        {user ? (
          <div className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/5 font-mono">
            <div className="h-8 w-8 rounded bg-brand/20 border border-brand/30 flex items-center justify-center font-bold text-xs text-brand uppercase">
              {user.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-textPrimary truncate">{user.name}</p>
              <p className="text-[8px] text-brand uppercase font-bold tracking-widest mt-0.5">PLATFORM_ADMIN</p>
            </div>
          </div>
        ) : null}

        {/* Theme Settings Widget */}
        <div className="flex items-center justify-between rounded border border-white/5 bg-transparent px-3 py-2 font-mono text-[10px] text-textMuted uppercase tracking-wider">
          <span>Theme Mode</span>
          <ThemeToggle showLabel={false} />
        </div>

        {/* Links to portals */}
        <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider">
          <Link
            href={ROUTES.STUDENT.HOME}
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem("lms-view-mode", "student");
              }
            }}
            className="flex items-center justify-center gap-1.5 rounded border border-white/5 py-2.5 text-textSecondary hover:border-brand/40 hover:text-brand transition"
          >
            ← Student Portal
          </Link>
          {user ? (
            <button
              onClick={() => void logout()}
              className="flex items-center justify-center gap-1.5 rounded border border-white/5 py-2.5 text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition"
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
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-[#131313] shadow-2xl">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
