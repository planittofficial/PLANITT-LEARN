"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants/routes";
import { MarkdownLesson } from "@/features/lesson-player/components/MarkdownLesson";
import { LessonCourseNav } from "@/features/lesson-player/components/LessonCourseNav";
import { VideoPlayer, VideoUnavailablePlaceholder } from "@/features/lesson-player/components/VideoPlayer";
import type { CourseDefinition, CourseModule, Lesson } from "@/lib/catalog/courses";
import type { CourseProgress } from "@/lib/learning/progress";
import { cn } from "@/lib/utils";

type LessonSidebarProps = {
  course: CourseDefinition;
  courseId: string;
  currentLessonId: string;
  progress: CourseProgress;
};

export function LessonSidebar({
  course,
  courseId,
  currentLessonId,
  progress,
}: LessonSidebarProps) {
  return (
    <aside className="space-y-4 xl:sticky xl:top-20">
      <LessonCourseNav
        course={course}
        courseId={courseId}
        currentLessonId={currentLessonId}
        progress={progress}
      />

      <div className="rounded-xl border border-borderSubtle bg-surface/80 p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-textMuted">Course</p>
        <p className="mt-1 font-headline text-sm font-semibold leading-snug text-textPrimary">
          {course.title}
        </p>
        <p className="mt-2 text-xs leading-6 text-textSecondary">{course.blurb}</p>
        <Link
          href={ROUTES.STUDENT.course(course.id)}
          className="mt-3 inline-flex text-sm font-medium text-brand hover:underline"
        >
          View course overview →
        </Link>
      </div>
    </aside>
  );
}

type LessonNavProps = {
  courseId: string;
  previous: { moduleId: string; lessonId: string; title: string } | null;
  next: { moduleId: string; lessonId: string; title: string } | null;
};

export function LessonNav({ courseId, previous, next }: LessonNavProps) {
  return (
    <nav className="mt-8 grid gap-4 border-t border-borderSubtle pt-8 sm:grid-cols-2">
      {previous ? (
        <Link
          href={ROUTES.STUDENT.lesson(courseId, previous.moduleId, previous.lessonId)}
          className="group flex items-center gap-3 rounded-xl border border-borderSubtle bg-surface p-4 transition hover:border-brand/30 hover:shadow-card"
        >
          <ArrowLeft className="h-5 w-5 shrink-0 text-textMuted transition group-hover:text-brand" />
          <div className="min-w-0 text-left">
            <p className="text-xs font-medium text-brand/80">Previous lesson</p>
            <p className="mt-1 truncate text-sm font-semibold text-textPrimary group-hover:text-brand">
              {previous.title}
            </p>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={ROUTES.STUDENT.lesson(courseId, next.moduleId, next.lessonId)}
          className="group flex items-center justify-end gap-3 rounded-xl border border-borderSubtle bg-surface p-4 transition hover:border-brand/30 hover:shadow-card sm:col-start-2"
        >
          <div className="min-w-0 text-right">
            <p className="text-xs font-medium text-brand/80">Next lesson</p>
            <p className="mt-1 truncate text-sm font-semibold text-textPrimary group-hover:text-brand">
              {next.title}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-textMuted transition group-hover:text-brand" />
        </Link>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-xl border border-dashed border-borderSubtle p-4 text-sm text-textMuted sm:col-start-2",
          )}
        >
          You have reached the end of this course
        </div>
      )}
    </nav>
  );
}

type LessonContentProps = {
  lesson: Lesson;
  courseId: string;
  userId?: string;
  onComplete: () => void;
};

function lessonHasVideo(lesson: Lesson): boolean {
  return (
    lesson.kind === "video" ||
    Boolean(lesson.content.videoAvailable) ||
    Boolean(lesson.content.videoUrl)
  );
}

export function LessonContent({ lesson, courseId, userId, onComplete }: LessonContentProps) {
  if (lessonHasVideo(lesson)) {
    return (
      <div className="overflow-hidden rounded-xl border border-borderSubtle bg-black shadow-card">
        {userId ? (
          <VideoPlayer
            lessonId={lesson.id}
            courseId={courseId}
            userId={userId}
            title={lesson.title}
            onComplete={onComplete}
          />
        ) : (
          <VideoUnavailablePlaceholder />
        )}
      </div>
    );
  }

  if (lesson.kind === "external" && lesson.content.externalUrl) {
    return (
      <a
        href={lesson.content.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brandForeground shadow-card transition hover:bg-brandHover"
      >
        Open external resource →
      </a>
    );
  }

  return (
    <div
      id="lesson-content"
      className="rounded-xl border border-borderSubtle bg-surface p-6 shadow-card sm:p-8"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-borderSubtle pb-3">
        <span className="h-2 w-2 rounded-full bg-brand" />
        <span className="text-sm font-semibold text-brand">Lesson reading</span>
      </div>
      {lesson.content.markdown ? (
        <MarkdownLesson markdown={lesson.content.markdown} />
      ) : (
        <p className="text-sm text-textSecondary">Lesson content is not available yet.</p>
      )}
    </div>
  );
}

export function LessonMetaBar({
  lesson,
  module,
  completed,
}: {
  lesson: Lesson;
  module: CourseModule;
  completed: boolean;
}) {
  const isVideoLesson = lessonHasVideo(lesson);

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-textSecondary">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-borderSubtle bg-elevated/60 px-3 py-1">
        <Clock className="h-3.5 w-3.5 shrink-0 text-brand" />
        {lesson.durationMinutes} min
      </span>
      <Badge className="py-0.5 text-xs">
        {isVideoLesson ? "Video" : lesson.kind === "external" ? "Resource" : "Reading"}
      </Badge>
      <span className="hidden h-1 w-1 rounded-full bg-textMuted sm:inline-block" />
      <span className="hidden truncate sm:inline">{module.title}</span>
      {completed ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
        </span>
      ) : null}
    </div>
  );
}

export function LessonHeader({
  lesson,
  module,
  courseTitle,
}: {
  lesson: Lesson;
  module: CourseModule;
  courseTitle: string;
}) {
  return (
    <header className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">
        {courseTitle} · {module.title}
      </p>
      <h1 className="font-headline text-2xl font-bold leading-tight tracking-tight text-textPrimary sm:text-3xl lg:text-[2rem]">
        {lesson.title}
      </h1>
    </header>
  );
}
