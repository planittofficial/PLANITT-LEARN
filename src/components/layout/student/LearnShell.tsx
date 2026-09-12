"use client";

import { AchievementUnlockToast } from "@/features/achievements";
import { StudentSearchShell } from "@/features/search";
import { StudentHeader } from "@/components/layout/student/StudentHeader";
import { StudentNav, StudentSidebar } from "@/components/layout/student/StudentNav";

export function LearnShell({ children }: { children: React.ReactNode }) {
  return (
    <StudentSearchShell>
      <div className="relative min-h-screen overflow-x-hidden bg-appBase pb-[3.25rem] md:pb-0">
        <StudentHeader />
        <StudentSidebar />
        <main className="min-h-screen pb-28 pt-16 md:pb-8 md:pl-64">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
            {children}
          </div>
        </main>
        <StudentNav />
        <AchievementUnlockToast />
      </div>
    </StudentSearchShell>
  );
}
