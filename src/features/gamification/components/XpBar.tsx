"use client";

import { Zap } from "lucide-react";

import { getLevelInfo } from "@/lib/learning/gamification";
import { cn } from "@/lib/utils";

type XpBarProps = {
  xp: number;
  className?: string;
  showLabel?: boolean;
};

export function XpBar({ xp, className, showLabel = true }: XpBarProps) {
  const level = getLevelInfo(xp);
  return (
    <div className={cn("space-y-2", className)}>
      {showLabel ? (
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-medium text-brand">
            <Zap className="h-3.5 w-3.5" />
            Level {level.level} · {level.title}
          </span>
          <span className="text-textMuted">{xp} XP</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-overlay-hover">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-500 dark:to-emerald-400"
          style={{ width: `${level.progressToNext}%` }}
        />
      </div>
      {level.nextLevel ? (
        <p className="text-[10px] text-textMuted">
          {level.nextMinXp! - xp} XP to Level {level.nextLevel}
        </p>
      ) : (
        <p className="text-[10px] text-textMuted">Max level reached</p>
      )}
    </div>
  );
}
