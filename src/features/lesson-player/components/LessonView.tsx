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

      <div className="rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md p-5 shadow-2xl">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-brand">THIS_NODE</p>
          <h3 className="mt-2 font-headline text-base font-extrabold text-textPrimary leading-snug tracking-tight">{lesson.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-textSecondary">{lesson.summary}</p>
        </div>

        <dl className="mt-4 space-y-2 font-mono text-[11px] border-t border-white/5 pt-4">
          <div className="flex justify-between">
            <dt className="text-textMuted">Duration</dt>
            <dd className="font-bold text-textPrimary">{lesson.durationMinutes} min</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-textMuted">Decoder Type</dt>
            <dd>
              <Badge className="font-mono text-[9px] tracking-wider py-0.5">
                {lesson.kind === "video" ? (
                  <Video className="mr-1 h-3 w-3" />
                ) : (
                  <FileText className="mr-1 h-3 w-3" />
                )}
                {lesson.kind.toUpperCase()}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-textMuted">Status</dt>
            <dd>
              {completed ? (
                <span className="text-brand font-bold uppercase tracking-wider">COMPLETED</span>
              ) : (
                <span className="text-amber-400 font-bold uppercase tracking-wider">IN_PROGRESS</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-white/5 pt-4">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] text-textMuted uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" />
            Module progress
          </div>
          <div className="w-full h-1 bg-white/5 rounded overflow-hidden mb-1">
            <div className="h-full bg-brand" style={{ width: `${moduleStats.percent}%` }} />
          </div>
          <div className="flex justify-between font-mono text-[9px] text-textMuted mt-1">
            <span>{moduleStats.percent}% Complete</span>
            <span>{moduleStats.completed}/{moduleStats.total} Nodes</span>
          </div>
        </div>

        <Link
          href={ROUTES.STUDENT.course(course.id)}
          className="mt-4 block text-center font-mono text-[10px] text-brand hover:underline uppercase tracking-wider"
        >
          [View Course Overview]
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
    <nav className="mt-10 grid gap-4 border-t border-white/5 pt-8 sm:grid-cols-2">
      {previous ? (
        <Link
          href={ROUTES.STUDENT.lesson(courseId, previous.moduleId, previous.lessonId)}
          className="group relative flex items-center gap-3 rounded-lg border border-white/5 bg-[#131313]/60 p-4 transition-all duration-200 hover:border-brand/40"
        >
          <div className="glow-border" />
          <ArrowLeft className="h-5 w-5 shrink-0 text-textMuted group-hover:text-brand transition-colors" />
          <div className="min-w-0 text-left relative z-10">
            <p className="font-mono text-[9px] text-brand/60 uppercase tracking-widest">&lt; PREV_EXECUTE</p>
            <p className="truncate text-xs font-bold text-textPrimary group-hover:text-brand mt-1">{previous.title}</p>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={ROUTES.STUDENT.lesson(courseId, next.moduleId, next.lessonId)}
          className="group relative flex items-center justify-end gap-3 rounded-lg border border-white/5 bg-[#131313]/60 p-4 transition-all duration-200 hover:border-brand/40 sm:col-start-2"
        >
          <div className="glow-border" />
          <div className="min-w-0 text-right relative z-10">
            <p className="font-mono text-[9px] text-brand/60 uppercase tracking-widest">NEXT_EXECUTE &gt;</p>
            <p className="truncate text-xs font-bold text-textPrimary group-hover:text-brand mt-1">{next.title}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-textMuted group-hover:text-brand transition-colors" />
        </Link>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-lg border border-dashed border-white/5 p-4 font-mono text-[10px] text-brand/60 sm:col-start-2",
          )}
        >
          &gt; ALL_NODES_EXECUTED
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
      <div className="overflow-hidden rounded-lg border border-white/5 bg-black shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-[#131313]/60 px-4 py-2.5 font-mono text-[9px] text-brand font-bold uppercase tracking-wider">
          <span>VIDEO_DECODER_NODE</span>
          <span className="text-textSecondary/60">{lesson.durationMinutes} min</span>
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
          <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-black text-xs text-textMuted font-mono uppercase tracking-wider">
            <Video className="h-8 w-8 opacity-30 text-brand" />
            Video stream is processing...
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
        className="inline-flex items-center gap-2 rounded bg-brand px-5 py-3 font-mono text-xs font-bold text-black uppercase tracking-wider hover:brightness-110 shadow-[0_0_12px_rgba(20,184,166,0.15)]"
      >
        Open External Resource →
      </a>
    );
  }

  return (
    <div id="lesson-content" className="rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
        <span className="font-mono text-[9px] text-brand uppercase tracking-widest font-bold">LESSON_CORE_LOG_MD</span>
      </div>
      {lesson.content.markdown ? (
        <MarkdownLesson markdown={lesson.content.markdown} />
      ) : (
        <p className="text-textSecondary font-mono text-xs uppercase tracking-wider">Lesson content not yet initialized.</p>
      )}
    </div>
  );
}

export function LessonMetaBar({ lesson, module }: { lesson: Lesson; module: CourseModule }) {
  return (
    <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-textMuted uppercase tracking-wider">
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        {lesson.durationMinutes} min
      </span>
      <span>//</span>
      <Badge className="font-mono text-[9px] py-0.5 tracking-wider">{lesson.kind.toUpperCase()}</Badge>
      <span>//</span>
      <span>{module.title}</span>
    </div>
  );
}
