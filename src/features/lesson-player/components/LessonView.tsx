"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Video
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
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
import { toYoutubeEmbedUrl, isYoutubeUrl } from "@/lib/video/video-url";

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
    <aside className="space-y-4 xl:sticky xl:top-20">
      <LessonCourseNav
        course={course}
        courseId={courseId}
        currentLessonId={lesson.id}
        progress={progress}
      />

      <div className="rounded-lg border border-borderSubtle bg-surface/60 backdrop-blur-md p-5 shadow-2xl">
        <div>
          <p className="text-xs font-semibold text-brand">Current lesson</p>
          <h3 className="mt-2 font-headline text-base font-extrabold text-textPrimary leading-snug tracking-tight">{lesson.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-textSecondary">{lesson.summary}</p>
        </div>

        <dl className="mt-4 space-y-2 border-t border-borderSubtle pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-textMuted">Duration</dt>
            <dd className="font-bold text-textPrimary">{lesson.durationMinutes} min</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-textMuted">Lesson type</dt>
            <dd>
              <Badge className="py-0.5 text-xs">
                {lesson.kind === "video" ? (
                  <Video className="mr-1 h-3 w-3" />
                ) : (
                  <FileText className="mr-1 h-3 w-3" />
                )}
                {lesson.kind === "video" ? "Video" : lesson.kind === "external" ? "Resource" : "Reading"}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-textMuted">Status</dt>
            <dd>
              {completed ? (
                <span className="font-semibold text-brand">Completed</span>
              ) : (
                <span className="font-semibold text-amber-400">In progress</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-borderSubtle pt-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-textMuted">
            <Layers className="h-3.5 w-3.5" />
            Module progress
          </div>
          <div className="w-full h-1 bg-elevated rounded overflow-hidden mb-1">
            <div className="h-full bg-brand" style={{ width: `${moduleStats.percent}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-xs text-textMuted">
            <span>{moduleStats.percent}% complete</span>
            <span>{moduleStats.completed}/{moduleStats.total} lessons</span>
          </div>
        </div>

        <Link
          href={ROUTES.STUDENT.course(course.id)}
          className="mt-4 block text-center text-sm font-medium text-brand hover:underline"
        >
          View course overview
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
    <nav className="mt-10 grid gap-4 border-t border-borderSubtle pt-8 sm:grid-cols-2">
      {previous ? (
        <Link
          href={ROUTES.STUDENT.lesson(courseId, previous.moduleId, previous.lessonId)}
          className="group relative flex items-center gap-3 rounded-lg border border-borderSubtle bg-surface/60 p-4 transition-all duration-200 hover:border-brand/40"
        >
          <div className="glow-border" />
          <ArrowLeft className="h-5 w-5 shrink-0 text-textMuted group-hover:text-brand transition-colors" />
          <div className="min-w-0 text-left relative z-10">
            <p className="text-xs font-medium text-brand/70">Previous lesson</p>
            <p className="truncate text-xs font-bold text-textPrimary group-hover:text-brand mt-1">{previous.title}</p>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={ROUTES.STUDENT.lesson(courseId, next.moduleId, next.lessonId)}
          className="group relative flex items-center justify-end gap-3 rounded-lg border border-borderSubtle bg-surface/60 p-4 transition-all duration-200 hover:border-brand/40 sm:col-start-2"
        >
          <div className="glow-border" />
          <div className="min-w-0 text-right relative z-10">
            <p className="text-xs font-medium text-brand/70">Next lesson</p>
            <p className="truncate text-xs font-bold text-textPrimary group-hover:text-brand mt-1">{next.title}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-textMuted group-hover:text-brand transition-colors" />
        </Link>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-lg border border-dashed border-borderSubtle p-4 text-sm text-brand/60 sm:col-start-2",
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

function resolvePlayableVideoUrl(lesson: Lesson): string | undefined {
  if (lesson.content.videoUrl?.trim()) return lesson.content.videoUrl.trim();
  if (lesson.content.externalUrl && isYoutubeUrl(lesson.content.externalUrl)) {
    return lesson.content.externalUrl.trim();
  }
  return undefined;
}

export function LessonContent({ lesson, courseId, userId, onComplete }: LessonContentProps) {
  const videoUrl = resolvePlayableVideoUrl(lesson);
  const isPlayableVideo =
    lesson.kind === "video" || Boolean(videoUrl && isYoutubeUrl(videoUrl));

  if (isPlayableVideo) {
    return (
      <div className="overflow-hidden rounded-lg border border-borderSubtle bg-black shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-borderSubtle bg-surface/60 px-4 py-2.5 text-sm font-medium text-textSecondary">
          <span>Lesson video</span>
          <span className="text-textSecondary/60">{lesson.durationMinutes} min</span>
        </div>
        {videoUrl && userId ? (
          <VideoPlayer
            lessonId={lesson.id}
            courseId={courseId}
            userId={userId}
            videoUrl={videoUrl}
            title={lesson.title}
            onComplete={onComplete}
          />
        ) : videoUrl ? (
          toYoutubeEmbedUrl(videoUrl) ? (
            <iframe
              src={toYoutubeEmbedUrl(videoUrl)!}
              title={lesson.title}
              className="aspect-video w-full bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              controls
              className="aspect-video w-full bg-black"
              title={lesson.title}
            />
          )
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-black text-sm text-textMuted">
            <Video className="h-8 w-8 opacity-30 text-brand" />
            This lesson video is not available yet.
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
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-black shadow-card transition hover:brightness-110"
      >
        Open External Resource →
      </a>
    );
  }

  return (
    <div id="lesson-content" className="rounded-lg border border-borderSubtle bg-surface/60 backdrop-blur-md p-6 shadow-2xl">
      <div className="mb-4 flex items-center gap-2 border-b border-borderSubtle pb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
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

export function LessonMetaBar({ lesson, module }: { lesson: Lesson; module: CourseModule }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-textMuted">
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        {lesson.durationMinutes} min
      </span>
      <span aria-hidden="true">•</span>
      <Badge className="py-0.5 text-xs">{lesson.kind === "video" ? "Video" : lesson.kind === "external" ? "Resource" : "Reading"}</Badge>
      <span aria-hidden="true">•</span>
      <span>{module.title}</span>
    </div>
  );
}
