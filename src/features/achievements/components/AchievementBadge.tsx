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

export const ACHIEVEMENT_ICONS: Record<AchievementDef["icon"], LucideIcon> = {
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
  { ring: string; bg: string; glow: string; text: string }
> = {
  common: {
    ring: "border-slate-500/20",
    bg: "from-slate-500/5 via-surface to-slate-500/5",
    glow: "shadow-sm",
    text: "text-slate-400 border-slate-500/20 bg-slate-500/10",
  },
  rare: {
    ring: "border-sky-500/30",
    bg: "from-sky-500/10 via-surface to-sky-500/5",
    glow: "shadow-lg shadow-sky-500/5 hover:border-sky-500/50 glow-brand",
    text: "text-sky-400 border-sky-500/20 bg-sky-500/10",
  },
  epic: {
    ring: "border-violet-500/40",
    bg: "from-violet-500/15 via-surface to-violet-500/5",
    glow: "shadow-lg shadow-violet-500/5 hover:border-violet-500/60 glow-purple",
    text: "text-violet-400 border-violet-500/20 bg-violet-500/10",
  },
  legendary: {
    ring: "border-amber-500/60 animate-pulse-glow",
    bg: "from-amber-500/25 via-surface to-orange-500/10",
    glow: "shadow-xl shadow-amber-500/10 hover:border-amber-500 glow-amber",
    text: "text-amber-400 border-amber-500/30 bg-amber-500/20",
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
  const Icon = ACHIEVEMENT_ICONS[def.icon];
  const rarity = RARITY_STYLES[def.rarity];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br transition",
        unlocked ? rarity.ring : "border-borderSubtle/80",
        unlocked ? rarity.bg : "from-surface to-overlay-faint",
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
              ? "border-borderSubtle bg-brand/10 text-brand"
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
              <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", rarity.text)}>
                {def.rarity}
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
