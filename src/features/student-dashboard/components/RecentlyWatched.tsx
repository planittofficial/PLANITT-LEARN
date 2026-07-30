"use client";

import Link from "next/link";
import { Terminal } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { RecentLesson } from "@/lib/learning/activity";
import { cn } from "@/lib/utils";

type RecentlyWatchedProps = {
  items: RecentLesson[];
  className?: string;
};

export function RecentlyWatched({ items, className }: RecentlyWatchedProps) {
  if (items.length === 0) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <section className={cn("col-span-12 mt-4", className)}>
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="font-headline text-lg font-bold text-textPrimary">Real-Time Signal Logs</span>
          <span className="px-2 py-0.5 bg-brand/10 text-brand font-mono text-[9px] rounded animate-pulse font-bold tracking-widest">LIVE_MONITOR</span>
        </div>
        <span className="font-mono text-[10px] text-brand/60">SYSTEM_UP_TO_DATE</span>
      </div>
      <div className="bg-black border border-borderSubtle rounded-xl p-6 font-mono text-[12px] leading-relaxed overflow-hidden relative shadow-inner terminal-glow">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Terminal className="text-brand text-[80px]" />
        </div>
        <div className="space-y-2 relative z-10">
          <p className="text-brand/40"><span className="text-brand font-bold">[00:00:01]</span> SYSTEM: Initializing command terminal logger...</p>
          <p className="text-textSecondary/50"><span className="text-brand font-bold">[00:00:05]</span> FETCH: Processing student learning data footprint...</p>
          
          {items.map((item) => (
            <p key={item.lessonId} className="text-textPrimary hover:text-brand transition-colors duration-150">
              <span className="text-brand font-bold mr-2">[{formatTime(item.watchedAt)}]</span>
              <span className="text-brand/70 font-semibold uppercase tracking-tighter mr-2">EXECUTE:</span>
              Initialize lesson <Link href={ROUTES.STUDENT.lesson(item.courseId, item.moduleId, item.lessonId)} className="text-brand hover:underline font-bold">{item.lessonTitle}</Link> inside <span className="opacity-70">{item.courseTitle}</span>
            </p>
          ))}
          
          <p className="text-textPrimary animate-pulse"><span className="text-brand font-bold">[_]</span> WAITING_FOR_USER_ACTION_</p>
        </div>
      </div>
    </section>
  );
}
