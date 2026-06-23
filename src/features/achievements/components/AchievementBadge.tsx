"use client";

import {
  Bookmark,
  BookOpen,
  Calendar,
  Clock,
  Flame,
  GraduationCap,
  Layers,
  Lock,
  PenLine,
  Star,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { ProgressBar } from "@/components/ui/ProgressBar";
import type { AchievementDef, AchievementRarity } from "@/lib/learning/achievements";
import { cn } from "@/lib/utils";

const ICONS: Record<AchievementDef["icon"], LucideIcon> = {
  flame: Flame,
  book: BookOpen,
  star: Star,
  trophy: Trophy,
  layers: Layers,
  graduation: GraduationCap,
  bookmark: Bookmark,
  pen: PenLine,
  target: Target,
  clock: Clock,
  calendar: Calendar,
  zap: Zap,
};

const RARITY_STYLES: Record<
  AchievementRarity,
  { ring: string; bg: string; glow: string }
> = {
  common: {
    ring: "border-borderSubtle",
    bg: "from-white/5 to-white/[0.02]",
    glow: "",
  },
  rare: {
    ring: "border-sky-500/30",
    bg: "from-sky-500/10 to-sky-500/5",
    glow: "shadow-sky-500/10",
  },
  epic: {
    ring: "border-violet-500/40",
    bg: "from-violet-500/15 to-violet-500/5",
    glow: "shadow-violet-500/15",
  },
  legendary: {
    ring: "border-amber-500/50",
    bg: "from-amber-500/20 via-orange-500/10 to-amber-500/5",
    glow: "shadow-amber-500/20",
  },
};

type AchievementBadgeProps = {
  def: AchievementDef;
  unlocked: boolean;
  current?: number;
  target?: number;
  percent?: number;
  compact?: boolean;
  className?: string;
};

export function AchievementBadge({
  def,
  unlocked,
  current = 0,
  target = def.target,
  percent = 0,
  compact = false,
  className,
}: AchievementBadgeProps) {
  const Icon = ICONS[def.icon];
  const rarity = RARITY_STYLES[def.rarity];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br transition",
        unlocked ? rarity.ring : "border-borderSubtle/80",
        unlocked ? rarity.bg : "from-surface to-black/20",
        unlocked && rarity.glow,
        unlocked ? "shadow-lg" : "opacity-90",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl border",
            compact ? "h-10 w-10" : "h-12 w-12",
            unlocked
              ? "border-white/10 bg-overlay-medium text-brand"
              : "border-borderSubtle bg-overlay-medium text-textMuted",
          )}
        >
          {unlocked ? (
            <Icon className={cn(compact ? "h-5 w-5" : "h-6 w-6")} />
          ) : (
            <Lock className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "font-semibold leading-tight",
                compact ? "text-sm" : "text-base",
                unlocked ? "text-textPrimary" : "text-textSecondary",
              )}
            >
              {def.title}
            </p>
            {unlocked ? (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                Unlocked
              </span>
            ) : null}
          </div>
          <p className={cn("mt-0.5 text-textMuted", compact ? "text-xs" : "text-sm")}>
            {def.description}
          </p>

          {!unlocked && !compact ? (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] text-textMuted">
                <span>
                  {current}/{target}
                </span>
                <span>{percent}%</span>
              </div>
              <ProgressBar value={percent} size="sm" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
