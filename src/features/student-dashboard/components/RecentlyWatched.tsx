"use client";

import Link from "next/link";
import { Clock, Play } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { RecentLesson } from "@/lib/learning/activity";
import { cn } from "@/lib/utils";

type RecentlyWatchedProps = {
  items: RecentLesson[];
  className?: string;
};

export function RecentlyWatched({ items, className }: RecentlyWatchedProps) {
  if (items.length === 0) return null;

  return (
    <section className={cn("rounded-2xl border border-borderSubtle bg-surface/80 p-5", className)}>
      <h2 className="mb-4 font-semibold text-textPrimary">Recently watched</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.lessonId}>
            <Link
              href={ROUTES.STUDENT.lesson(item.courseId, item.moduleId, item.lessonId)}
              className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-borderSubtle hover:bg-overlay-faint"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Play className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium group-hover:text-brand">{item.lessonTitle}</p>
                <p className="truncate text-xs text-textMuted">{item.courseTitle}</p>
              </div>
              <span className="shrink-0 text-[10px] text-textMuted">
                <Clock className="mr-0.5 inline h-3 w-3" />
                {formatRelative(item.watchedAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
