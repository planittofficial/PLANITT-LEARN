"use client";

import { AchievementUnlockToast } from "@/features/achievements";
import { StudentSearchShell } from "@/features/search";
import { StudentHeader } from "@/components/layout/student/StudentHeader";
import { StudentNav, StudentSidebar } from "@/components/layout/student/StudentNav";

export function LearnShell({ children }: { children: React.ReactNode }) {
  return (
    <StudentSearchShell>
      <div className="min-h-screen bg-appBase pb-[3.25rem] md:pb-0 overflow-x-hidden relative">
        <div className="grain-overlay fixed inset-0 z-[60]" />
        <StudentHeader />
        <StudentSidebar />
        <main className="md:pl-64 pt-20 pb-32 md:pb-8 min-h-screen">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
        <StudentNav />
        <AchievementUnlockToast />
      </div>
    </StudentSearchShell>
  );
}
