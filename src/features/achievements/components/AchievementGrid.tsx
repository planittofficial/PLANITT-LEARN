"use client";

import { useMemo, useState } from "react";

import { AchievementBadge } from "@/features/achievements/components/AchievementBadge";
import {
  CATEGORY_LABELS,
  type AchievementCategory,
  type AchievementProgress,
} from "@/lib/learning/achievements";
import { cn } from "@/lib/utils";

type AchievementGridProps = {
  achievements: AchievementProgress[];
  className?: string;
};

const CATEGORIES: (AchievementCategory | "all")[] = [
  "all",
  "streak",
  "lessons",
  "level",
  "course",
  "engagement",
  "quiz",
  "time",
];

export function AchievementGrid({ achievements, className }: AchievementGridProps) {
  const [filter, setFilter] = useState<AchievementCategory | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return achievements;
    return achievements.filter((a) => a.def.category === filter);
  }, [achievements, filter]);

  const unlockedInFilter = filtered.filter((a) => a.unlocked).length;

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const count =
            cat === "all"
              ? achievements.length
              : achievements.filter((a) => a.def.category === cat).length;
          if (cat !== "all" && count === 0) return null;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition",
                filter === cat
                  ? "bg-brand/15 text-brand"
                  : "bg-overlay-hover text-textMuted hover:text-textSecondary",
              )}
            >
              {cat === "all" ? "All" : CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-sm text-textMuted">
        {unlockedInFilter} of {filtered.length} unlocked
        {filter !== "all" ? ` in ${CATEGORY_LABELS[filter]}` : ""}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((item) => (
          <AchievementBadge
            key={item.def.id}
            def={item.def}
            unlocked={item.unlocked}
            current={item.current}
            target={item.target}
            percent={item.percent}
          />
        ))}
      </div>
    </div>
  );
}
