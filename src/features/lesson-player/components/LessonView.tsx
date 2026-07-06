"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ROUTES } from "@/constants/routes";
import { MarkdownLesson } from "@/features/lesson-player/components/MarkdownLesson";
import { LessonCourseNav } from "@/features/lesson-player/components/LessonCourseNav";
import { LessonNotes } from "@/features/lesson-player/components/LessonNotes";
import { LessonResources } from "@/features/lesson-player/components/LessonResources";
import { VideoPlayer } from "@/features/lesson-player/components/VideoPlayer";
import type { CourseDefinition, CourseModule, Lesson } from "@/lib/catalog/courses";
import { getModuleProgressStats } from "@/lib/learning/course-progress";
import type { CourseProgress } from "@/lib/learning/progress";
import { cn } from "@/lib/utils";

type LessonSidebarProps = {
  lesson: Lesson;
  module: CourseModule;
  course: CourseDefinition;
  progress: CourseProgress;
  completed: boolean;
};

export function LessonSidebar({
  lesson,
  module,
  course,
  courseId,
  progress,
  completed,
  userId,
}: LessonSidebarProps & { courseId: string; userId?: string }) {
  const moduleLessonIds = module.lessons.map((l) => l.id);
  const moduleStats = getModuleProgressStats(progress, moduleLessonIds);

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <LessonCourseNav
        course={course}
        courseId={courseId}
        currentLessonId={lesson.id}
        progress={progress}
      />

      <div className="rounded-xl border border-borderSubtle bg-surface p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand">This lesson</p>
          <h3 className="mt-2 text-base font-semibold">{lesson.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-textSecondary">{lesson.summary}</p>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-textMuted">Duration</dt>
            <dd className="font-medium">{lesson.durationMinutes} min</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-textMuted">Type</dt>
            <dd>
              <Badge variant={lesson.kind === "video" ? "brand" : "default"}>
                {lesson.kind === "video" ? (
                  <Video className="mr-1 h-3 w-3" />
                ) : (
                  <FileText className="mr-1 h-3 w-3" />
                )}
                {lesson.kind}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-textMuted">Status</dt>
            <dd>
              {completed ? (
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="warning">In progress</Badge>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-borderSubtle pt-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-textMuted">
            <Layers className="h-3.5 w-3.5" />
            Module progress
          </div>
          <ProgressBar
            value={moduleStats.percent}
            showLabel
            label={`${moduleStats.completed}/${moduleStats.total} lessons`}
            size="sm"
          />
        </div>

        <Link
          href={ROUTES.STUDENT.course(course.id)}
          className="mt-4 block text-center text-xs text-brand hover:underline"
        >
          View course overview →
        </Link>
      </div>

      <LessonResources lesson={lesson} />
      {userId ? <LessonNotes userId={userId} lessonId={lesson.id} /> : null}
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
    <nav className="mt-10 grid gap-3 border-t border-borderSubtle pt-8 sm:grid-cols-2">
      {previous ? (
        <Link
          href={ROUTES.STUDENT.lesson(courseId, previous.moduleId, previous.lessonId)}
          className="group flex items-center gap-3 rounded-xl border border-borderSubtle bg-surface p-4 transition hover:border-brand/30 hover:bg-brand/5"
        >
          <ArrowLeft className="h-5 w-5 shrink-0 text-textMuted group-hover:text-brand" />
          <div className="min-w-0 text-left">
            <p className="text-xs text-textMuted">Previous</p>
            <p className="truncate text-sm font-medium group-hover:text-brand">{previous.title}</p>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={ROUTES.STUDENT.lesson(courseId, next.moduleId, next.lessonId)}
          className="group flex items-center justify-end gap-3 rounded-xl border border-borderSubtle bg-surface p-4 transition hover:border-brand/30 hover:bg-brand/5 sm:col-start-2"
        >
          <div className="min-w-0 text-right">
            <p className="text-xs text-textMuted">Next</p>
            <p className="truncate text-sm font-medium group-hover:text-brand">{next.title}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-textMuted group-hover:text-brand" />
        </Link>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-xl border border-dashed border-borderSubtle p-4 text-sm text-textMuted sm:col-start-2",
          )}
        >
          🎉 Last lesson — great work!
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

export function LessonContent({ lesson, courseId, userId, onComplete }: LessonContentProps) {
  if (lesson.kind === "video") {
    return (
      <div className="overflow-hidden rounded-2xl border border-borderSubtle bg-gradient-to-b from-white/5 to-black/40 shadow-2xl shadow-black/40">
        <div className="border-b border-borderSubtle/50 px-4 py-2 text-xs text-textMuted">
          Video lesson · watch {lesson.durationMinutes} min to complete
        </div>
        {lesson.content.videoUrl && userId ? (
          <VideoPlayer
            lessonId={lesson.id}
            courseId={courseId}
            userId={userId}
            videoUrl={lesson.content.videoUrl}
            title={lesson.title}
            onComplete={onComplete}
          />
        ) : lesson.content.videoUrl ? (
          <video
            src={lesson.content.videoUrl}
            controls
            className="aspect-video w-full bg-black"
            title={lesson.title}
          />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-black/60 text-sm text-textMuted">
            <Video className="h-10 w-10 opacity-30" />
            Video will be added by the instructor
          </div>
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
        className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brandForeground hover:bg-brandHover dark:text-black"
      >
        Open external resource →
      </a>
    );
  }

  return (
    <div id="lesson-content" className="rounded-2xl border border-borderSubtle bg-surface p-6 sm:p-8">
      {lesson.content.markdown ? (
        <MarkdownLesson markdown={lesson.content.markdown} />
      ) : (
        <p className="text-textSecondary">Lesson content coming soon.</p>
      )}
    </div>
  );
}

export function LessonMetaBar({ lesson, module }: { lesson: Lesson; module: CourseModule }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-textMuted">
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        {lesson.durationMinutes} min
      </span>
      <span>•</span>
      <Badge variant={lesson.kind === "video" ? "brand" : "default"}>{lesson.kind}</Badge>
      <span>•</span>
      <span>{module.title}</span>
    </div>
  );
}
