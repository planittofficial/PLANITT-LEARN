"use client";

import { cn } from "@/lib/utils";
import type { WeeklyDay } from "@/lib/learning/activity";

type WeeklyProgressChartProps = {
  days: WeeklyDay[];
  className?: string;
};

export function WeeklyProgressChart({ days, className }: WeeklyProgressChartProps) {
  const max = Math.max(1, ...days.map((d) => d.lessonsCompleted));
  const total = days.reduce((s, d) => s + d.lessonsCompleted, 0);

  return (
    <section className={cn("rounded-2xl border border-borderSubtle bg-surface/80 p-5", className)}>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-semibold text-textPrimary">This week</h2>
          <p className="text-xs text-textMuted">{total} lesson{total !== 1 ? "s" : ""} completed</p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        {days.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-24 w-full items-end justify-center">
              <div
                className={cn(
                  "w-full max-w-[2rem] rounded-t-lg transition-all duration-500",
                  day.lessonsCompleted > 0
                    ? "bg-gradient-to-t from-brand to-brandBright"
                    : "bg-overlay-hover",
                )}
                style={{ height: `${Math.max(8, (day.lessonsCompleted / max) * 100)}%` }}
                title={`${day.lessonsCompleted} lessons`}
              />
            </div>
            <span className="text-[10px] font-medium text-textMuted">{day.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
