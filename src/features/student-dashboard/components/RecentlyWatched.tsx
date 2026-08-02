"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";
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
          <span className="font-headline text-lg font-bold text-textPrimary">Recent lessons</span>
          <span className="px-2 py-0.5 bg-brand/10 text-brand text-[9px] rounded animate-pulse font-semibold tracking-[0.18em] uppercase">Live</span>
        </div>
        <span className="text-[10px] text-brand/60 tracking-wide">Updated now</span>
      </div>
      <div className="bg-surface border border-borderSubtle rounded-xl p-6 text-sm leading-relaxed overflow-hidden relative shadow-card terminal-glow">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Clock3 className="text-brand text-[80px]" />
        </div>
        <div className="space-y-2 relative z-10">
          <p className="text-brand/40"><span className="text-brand font-semibold">[00:00:01]</span> Learning activity is ready.</p>
          <p className="text-textSecondary/50"><span className="text-brand font-semibold">[00:00:05]</span> Reviewing the lessons you opened recently.</p>
          
          {items.map((item) => (
            <p key={item.lessonId} className="text-textPrimary hover:text-brand transition-colors duration-150">
              <span className="text-brand font-semibold mr-2">[{formatTime(item.watchedAt)}]</span>
              <span className="text-brand/70 font-medium mr-2">Resume:</span>
              <Link href={ROUTES.STUDENT.lesson(item.courseId, item.moduleId, item.lessonId)} className="text-brand hover:underline font-semibold">{item.lessonTitle}</Link>
              {" "}
              in <span className="opacity-70">{item.courseTitle}</span>
            </p>
          ))}
          
          <p className="text-textPrimary animate-pulse"><span className="text-brand font-semibold">[ ]</span> Waiting for your next lesson.</p>
        </div>
      </div>
    </section>
  );
}
