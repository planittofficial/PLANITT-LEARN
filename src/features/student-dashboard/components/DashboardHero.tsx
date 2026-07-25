"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CourseDefinition } from "@/lib/catalog/courses";
import { courseIcon, courseThumbnailClass } from "@/lib/catalog/course-visuals";
import { getContinueLessonUrl } from "@/lib/learning/course-progress";
import { cn } from "@/lib/utils";

type ContinueLearningCardProps = {
  course: CourseDefinition;
  userId: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
};

export function ContinueLearningCard({
  course,
  userId,
  progressPercent,
  completedLessons,
  totalLessons,
}: ContinueLearningCardProps) {
  const continueUrl = getContinueLessonUrl(userId, course);
  if (!continueUrl) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/10 via-surface to-appBase p-6 sm:p-8">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl",
              courseThumbnailClass(course.category),
            )}
          >
            {courseIcon(course.category)}
          </div>
          <div>
            <Badge variant="brand" className="mb-2">
              <Play className="mr-1 h-3 w-3" />
              Continue learning
            </Badge>
            <h2 className="text-xl font-bold text-textPrimary">{course.title}</h2>
            <p className="mt-1 text-sm text-textSecondary">
              Pick up where you left off — {completedLessons} of {totalLessons} lessons done
            </p>
            <div className="mt-4 max-w-xs">
              <ProgressBar value={progressPercent} showLabel size="md" />
            </div>
          </div>
        </div>
        <Link
          href={continueUrl}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brandForeground transition hover:bg-brandHover"
        >
          Resume
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
