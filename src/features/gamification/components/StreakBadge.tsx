"use client";

import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";

type StreakBadgeProps = {
  streak: number;
  size?: "sm" | "md";
  className?: string;
};

export function StreakBadge({ streak, size = "md", className }: StreakBadgeProps) {
  if (streak <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-orange-500/15 font-semibold text-orange-400",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
    >
      <Flame className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      {streak} day{streak !== 1 ? "s" : ""}
    </span>
  );
}
