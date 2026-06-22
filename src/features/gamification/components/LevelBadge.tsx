"use client";

import { getLevelInfo } from "@/lib/learning/gamification";
import { cn } from "@/lib/utils";

type LevelBadgeProps = {
  xp: number;
  className?: string;
};

export function LevelBadge({ xp, className }: LevelBadgeProps) {
  const level = getLevelInfo(xp);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand",
        className,
      )}
    >
      Lv.{level.level}
    </span>
  );
}
