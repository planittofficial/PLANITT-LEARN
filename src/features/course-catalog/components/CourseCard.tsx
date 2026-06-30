"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  Lock,
  Play,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ROUTES } from "@/constants/routes";
import { planittCheckoutUrl } from "@/constants/urls";
import {
  courseIcon,
  courseInitials,
  courseThumbnailClass,
} from "@/lib/catalog/course-visuals";
import type { CourseDefinition } from "@/lib/catalog/courses";
import { countCourseLessons } from "@/lib/catalog/courses";
import { cn } from "@/lib/utils";

const LEVEL_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Advanced: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

function estimateLearners(courseId: string): string {
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) hash = courseId.charCodeAt(i) + ((hash << 5) - hash);
  const n = 800 + (Math.abs(hash) % 4200);
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

type CourseCardProps = {
  course: CourseDefinition;
  enrolled: boolean;
  progressPercent?: number;
  completedLessons?: number;
  totalLessons?: number;
  preview?: boolean;
  variant?: "default" | "compact";
};

export function CourseCard({
  course,
  enrolled,
  progressPercent = 0,
  completedLessons = 0,
  totalLessons,
  preview = false,
  variant = "default",
}: CourseCardProps) {
  const lessonCount = totalLessons ?? countCourseLessons(course);
  const isComplete = enrolled && progressPercent === 100;
  const inProgress = enrolled && progressPercent > 0 && progressPercent < 100;
  const notStarted = enrolled && progressPercent === 0;
  const levelStyle = LEVEL_STYLES[course.level] ?? LEVEL_STYLES.Beginner;

  const statusBadge = !enrolled ? (
    <Badge variant="locked">
      <Lock className="h-3 w-3" />
      Locked
    </Badge>
  ) : isComplete ? (
    <Badge variant="success">Completed</Badge>
  ) : inProgress ? (
    <Badge variant="brand">In Progress</Badge>
  ) : (
    <Badge variant="warning">New</Badge>
  );

  const ctaLabel = !enrolled
    ? "Unlock on Planitt"
    : isComplete
      ? "Review Course"
      : inProgress
        ? "Continue Learning"
        : "Start Learning";

  const getTradingTag = (category: string) => {
    switch (category) {
      case "Indian Stocks": return { label: "Liquidity: High 💸", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" };
      case "Forex": return { label: "Spread: Tight 💱", color: "text-sky-400 border-sky-500/20 bg-sky-500/5" };
      case "F&O": return { label: "Leverage: Active 📊", color: "text-violet-400 border-violet-500/20 bg-violet-500/5" };
      case "Crypto": return { label: "Volatility: High ⚡", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" };
      case "Psychology": return { label: "Risk Management 🧠", color: "text-rose-400 border-rose-500/20 bg-rose-500/5" };
      default: return { label: "Execution: Live ⚡", color: "text-brand border-brand/20 bg-brand/5" };
    }
  };
  const tradingTag = getTradingTag(course.category);

  const inner = (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-surface transition-all duration-300 card-trading",
        enrolled
          ? "border-borderSubtle hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
          : "border-borderSubtle/60 opacity-95 hover:opacity-100",
        variant === "compact" && "flex-row",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br",
          courseThumbnailClass(course.category),
          variant === "default" ? "h-40" : "h-auto w-28 shrink-0 sm:w-32",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="text-3xl drop-shadow-lg">{courseIcon(course.category)}</span>
          <span className="rounded-md bg-overlay-medium px-2 py-0.5 text-xs font-bold text-white/95 backdrop-blur-sm">
            {courseInitials(course.title)}
          </span>
        </div>
        {enrolled && inProgress ? (
          <div
            className="absolute left-0 top-0 h-1 bg-gradient-to-r from-brand to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        ) : null}
        {enrolled && notStarted ? (
          <div className="absolute right-3 top-3">
            <span className="animate-pulse-glow rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-black">
              New
            </span>
          </div>
        ) : null}
        {enrolled && inProgress ? (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {progressPercent}%
            </span>
          </div>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col p-5", variant === "compact" && "py-4")}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">{course.category}</Badge>
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase", levelStyle)}>
            {course.level}
          </span>
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", tradingTag.color)}>
            {tradingTag.label}
          </span>
          <div className="ml-auto">{statusBadge}</div>
        </div>

        <h3 className="mt-3 text-lg font-semibold leading-snug text-textPrimary transition-colors group-hover:text-brand">
          {course.title}
        </h3>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-textSecondary">
          {course.blurb}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-textMuted">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.modules.length} modules · {lessonCount} lessons
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {estimateLearners(course.id)} learners
          </span>
        </div>

        {enrolled && lessonCount > 0 ? (
          <div className="mt-4">
            <ProgressBar
              value={progressPercent}
              showLabel
              label={`${completedLessons}/${lessonCount} lessons`}
              size="sm"
            />
          </div>
        ) : null}

        <div className="mt-5">
          {enrolled ? (
            <span
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition",
                isComplete
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "bg-gradient-to-r from-brand to-emerald-400 text-black shadow-lg shadow-brand/20 group-hover:brightness-110",
              )}
            >
              {notStarted ? <Sparkles className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              {ctaLabel}
            </span>
          ) : (
            <a
              href={planittCheckoutUrl(course.id)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-borderSubtle px-4 py-3 text-sm text-textMuted transition hover:border-brand/30 hover:text-brand"
            >
              <Lock className="h-4 w-4" />
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
    </article>
  );

  if (enrolled && !preview) {
    return (
      <Link href={ROUTES.STUDENT.course(course.id)} className="block h-full">
        {inner}
      </Link>
    );
  }

  return inner;
}
