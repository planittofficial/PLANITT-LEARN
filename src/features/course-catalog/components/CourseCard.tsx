"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
  Lock,
  Play,
  Sparkles,
  Users,
  ShieldAlert
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants/routes";
import { alvestCheckoutUrl } from "@/constants/urls";
import {
  courseCoverSrc,
  courseIcon,
  courseInitials
} from "@/lib/catalog/course-visuals";
import type { CourseDefinition } from "@/lib/catalog/courses";
import { countCourseLessons } from "@/lib/catalog/courses";
import { cn } from "@/lib/utils";

const LEVEL_STYLES: Record<string, string> = {
  Beginner: "border-brand/20 bg-brand/5 text-brand",
  Intermediate: "border-amber-500/20 bg-amber-500/5 text-amber-400",
  Advanced: "border-red-500/20 bg-red-500/5 text-red-400",
};

const RISK_BADGES: Record<string, string> = {
  "learn-basics": "Risk: Low",
  "learn-strategies": "Risk: Med",
  "learn-risk-management": "Risk: High",
  "learn-advanced-tech": "Spread: Low",
  "learn-arbitrage": "Spread: Med",
  "learn-hft": "Leverage: High"
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
  const coverSrc = courseCoverSrc(course.category);
  const riskLabel = RISK_BADGES[course.id] ?? "Spread: Low";

  const ctaLabel = !enrolled
    ? "BUY FOR $249"
    : isComplete
      ? "REVIEW MODULE"
      : inProgress
        ? "RESUME MODULE"
        : "START MODULE";

  const inner = (
    <article
      className={cn(
        "course-card-stitch relative group flex flex-col h-full bg-[#131313]/60 border rounded-lg overflow-hidden transition-all duration-300",
        enrolled ? "border-white/5 hover:border-brand/40" : "border-white/5 opacity-80 hover:opacity-100",
        variant === "compact" && "flex-row",
      )}
    >
      <div className="glow-border" />

      {/* Course Banner Image */}
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-[#1C1B1B] to-[#0A0A0A]",
          variant === "default" ? "h-44 sm:h-48" : "h-auto w-28 shrink-0 sm:w-32",
        )}
      >
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
              !enrolled && "grayscale opacity-30"
            )}
            draggable={false}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Status Pill */}
        <div className="absolute top-4 left-4 flex gap-1.5">
          {enrolled ? (
            <span className="bg-brand/20 backdrop-blur-md text-brand border border-brand/30 px-2.5 py-0.5 rounded-sm font-mono text-[9px] uppercase tracking-wider font-bold">
              {isComplete ? "COMPLETED" : inProgress ? "IN_PROGRESS" : "UNLOCKED"}
            </span>
          ) : (
            <span className="bg-white/5 backdrop-blur-md text-textMuted border border-white/10 px-2.5 py-0.5 rounded-sm font-mono text-[9px] uppercase tracking-wider font-bold flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" /> LOCKED
            </span>
          )}
          
          <span className="bg-black/60 backdrop-blur-md text-textSecondary px-2 py-0.5 rounded-sm font-mono text-[9px] uppercase tracking-wider">
            {riskLabel}
          </span>
        </div>

        {/* Emoji Icon */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/45 text-2xl shadow-lg backdrop-blur-md ring-1 ring-white/15">
            {courseIcon(course.category)}
          </span>
        </div>
      </div>

      {/* Course Details */}
      <div className="p-5 flex flex-col flex-grow relative z-10">
        <div className="flex justify-between items-start mb-2">
          <Badge className="font-mono text-[9px] py-0.5 tracking-wider">{course.category}</Badge>
          <span className={cn("border px-2 py-0.5 rounded-sm font-mono text-[9px] tracking-wider uppercase font-bold", levelStyle)}>
            {course.level}
          </span>
        </div>

        <h3 className="font-headline text-lg font-bold text-textPrimary leading-snug tracking-tight group-hover:text-brand transition-colors">
          {course.title}
        </h3>

        <p className="text-textSecondary text-xs leading-relaxed mt-2 flex-grow line-clamp-2">
          {course.blurb}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] text-textMuted border-t border-white/5 pt-3">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {lessonCount} lessons
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {estimateLearners(course.id)} learners
          </span>
        </div>

        {/* Progress Bar (if enrolled) */}
        {enrolled && lessonCount > 0 ? (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-textSecondary">
              <span>Progress</span>
              <span className="text-brand font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded overflow-hidden">
              <div className="h-full bg-brand transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        ) : null}

        {/* Button Call-to-action */}
        <div className="mt-5">
          {enrolled ? (
            <button className="w-full bg-brand text-black py-2.5 rounded font-mono text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(20,184,166,0.1)]">
              {notStarted ? <Sparkles className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              {ctaLabel}
            </button>
          ) : (
            <a
              href={alvestCheckoutUrl(course.id)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full border border-brand text-brand py-2.5 rounded font-mono text-xs font-bold hover:bg-brand/5 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="h-3.5 w-3.5" />
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
