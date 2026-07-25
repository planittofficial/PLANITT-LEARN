"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { AdminSidebar } from "@/components/layout/admin/AdminSidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-appBase">
      <AdminSidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-borderSubtle bg-appBase/80 backdrop-blur-lg lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-textSecondary hover:bg-overlay-hover hover:text-textPrimary"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="flex-1 text-sm font-semibold">
              Alvest <span className="text-violet-400">Console</span>
            </p>
            <ThemeToggle />
          </div>
        </header>

        <main className={cn("mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8")}>
          <div className="animate-in fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
