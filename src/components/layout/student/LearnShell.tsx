"use client";

import { AchievementUnlockToast } from "@/features/achievements";
import { StudentSearchShell } from "@/features/search";
import { StudentHeader } from "@/components/layout/student/StudentHeader";
import { StudentNav } from "@/components/layout/student/StudentNav";

export function LearnShell({ children }: { children: React.ReactNode }) {
  return (
    <StudentSearchShell>
      <div className="min-h-screen pb-[3.25rem] md:pb-0">
        <StudentHeader />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
        <StudentNav />
        <AchievementUnlockToast />
      </div>
    </StudentSearchShell>
  );
}
