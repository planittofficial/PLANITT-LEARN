"use client";

import Link from "next/link";
import {
  BookOpen,
  Bookmark,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  StickyNote,
  type LucideIcon,
} from "lucide-react";

import type { SearchResult, SearchResultType } from "@/lib/learning/search";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<SearchResultType, LucideIcon> = {
  course: GraduationCap,
  lesson: BookOpen,
  module: Layers,
  bookmark: Bookmark,
  note: StickyNote,
};

const TYPE_COLORS: Record<SearchResultType, string> = {
  course: "text-brand bg-brand/15",
  lesson: "text-emerald-400 bg-emerald-500/15",
  module: "text-sky-400 bg-sky-500/15",
  bookmark: "text-amber-400 bg-amber-500/15",
  note: "text-violet-400 bg-violet-500/15",
};

type SearchResultItemProps = {
  result: SearchResult;
  compact?: boolean;
  onSelect?: () => void;
};

export function SearchResultItem({ result, compact = false, onSelect }: SearchResultItemProps) {
  const Icon = TYPE_ICONS[result.type];
  const color = TYPE_COLORS[result.type];

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-transparent transition hover:border-borderSubtle hover:bg-white/[0.03]",
        compact ? "p-2.5" : "p-3",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg",
          compact ? "h-9 w-9" : "h-10 w-10",
          color,
        )}
      >
        <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate font-medium",
              compact ? "text-sm" : "text-base",
              result.enrolled ? "text-textPrimary" : "text-textSecondary",
            )}
          >
            {result.title}
          </p>
          {!result.enrolled && result.type !== "course" ? (
            <Lock className="h-3 w-3 shrink-0 text-textMuted" />
          ) : null}
        </div>
        <p className={cn("truncate text-textMuted", compact ? "text-xs" : "text-sm")}>
          {result.subtitle}
        </p>
        {result.meta ? (
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-textMuted">{result.meta}</p>
        ) : null}
      </div>

      {result.type === "lesson" ? (
        <FileText className="mt-1 h-3.5 w-3.5 shrink-0 text-textMuted" />
      ) : null}
    </div>
  );

  return (
    <Link href={result.href} onClick={onSelect} className="block">
      {content}
    </Link>
  );
}
