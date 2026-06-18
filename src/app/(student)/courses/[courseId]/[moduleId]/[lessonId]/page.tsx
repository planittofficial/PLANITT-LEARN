"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LearnShell } from "@/components/layout/student";
import { ROUTES } from "@/constants/routes";
import { planittCheckoutUrl } from "@/constants/urls";
import { useAuth } from "@/context/auth-context";
import { VideoPlayer } from "@/features/lesson-player";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { getLessonByPath } from "@/lib/catalog/courses";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import {
  loadCourseProgress,
  saveLessonComplete,
  type CourseProgress,
} from "@/lib/learning/progress";

export default function LessonPage() {
  const params = useParams<{ courseId: string; moduleId: string; lessonId: string }>();
  const { courseId, moduleId, lessonId } = params;
  const resolved = getLessonByPath(courseId, moduleId, lessonId);
  const { user } = useAuth();
  const { enrolledIds, loading } = useEnrollment();
  const [progress, setProgress] = useState<CourseProgress>({});

  useEffect(() => {
    if (!user?.id) return;
    setProgress(loadCourseProgress(user.id, courseId));
  }, [courseId, user?.id]);

  if (!resolved) notFound();
  const { course, module, lesson } = resolved;

  const allLessons = course.modules.flatMap((m) =>
  m.lessons.map((l) => ({
    lesson: l,
    moduleId: m.id,
  }))
);

const currentIndex = allLessons.findIndex(
  (item) => item.lesson.id === lesson.id
);

const previousLesson =
  currentIndex > 0
    ? allLessons[currentIndex - 1]
    : null;

const nextLesson =
  currentIndex < allLessons.length - 1
    ? allLessons[currentIndex + 1]
    : null;

  if (loading) {
    return (
      <LearnShell>
        <p className="text-sm text-textSecondary">Loading lesson…</p>
      </LearnShell>
    );
  }

  if (!isEnrolledInCourse(enrolledIds, courseId)) {
    return (
      <LearnShell>
        <p className="text-sm text-textSecondary">Enroll on Planitt to access this lesson.</p>
        <a href={planittCheckoutUrl(courseId)} className="mt-2 inline-block text-sm text-brand">
          Buy course →
        </a>
      </LearnShell>
    );
  }

  const completed = progress[lesson.id]?.completed;

  const markComplete = () => {
    if (!user?.id) return;
    setProgress(saveLessonComplete(user.id, courseId, lesson.id));
  };

  return (
    <LearnShell>
      <Link
        href={ROUTES.STUDENT.course(courseId)}
        className="text-sm text-textMuted hover:text-brand"
      >
        ← {course.title}
      </Link>
      <p className="mt-4 text-xs uppercase tracking-wide text-brand">{module.title}</p>
      <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
      <p className="mt-2 text-sm text-textSecondary">{lesson.summary}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-textMuted">
  <span>
    Duration: {lesson.durationMinutes} min
  </span>
    <span>•</span>

  <span>
    Type: {lesson.kind}
  </span>
    <span>•</span>


  <span>
    Module: {module.title}
  </span>
</div>

      {lesson.kind === "video" ? (
  <div className="mt-8 grid gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2 rounded-xl border border-borderSubtle bg-surface p-4">
      {lesson.content.videoUrl && user?.id ? (
        <VideoPlayer
          lessonId={lesson.id}
          courseId={courseId}
          userId={user.id}
          videoUrl={lesson.content.videoUrl}
          title={lesson.title}
          onComplete={() => setProgress(saveLessonComplete(user.id, courseId, lesson.id))}
        />
      ) : lesson.content.videoUrl ? (
        <iframe
          src={lesson.content.videoUrl}
          title={lesson.title}
          className="aspect-video w-full rounded-lg"
          allowFullScreen
        />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-lg bg-black/20 text-sm text-textMuted">
          Video will appear here when added by the instructor
        </div>
      )}
    </div>

    <div className="rounded-xl border border-borderSubtle bg-surface p-5">
      <h3 className="text-lg font-semibold">
        Lecture Overview
      </h3>

      <div className="mt-4 space-y-3 text-sm">
        <p className="text-textSecondary">
          {lesson.summary}
        </p>

        <p>
          <span className="text-textMuted">
            Duration:
          </span>{" "}
          {lesson.durationMinutes} min
        </p>

        <p>
          <span className="text-textMuted">
            Module:
          </span>{" "}
          {module.title}
        </p>

        <p>
          <span className="text-textMuted">
            Lesson Type:
          </span>{" "}
          {lesson.kind}
        </p>
      </div>
    </div>
  </div>
) : (
  <div className="mt-8 grid gap-6 lg:grid-cols-3">

    <div className="lg:col-span-2 rounded-xl border border-borderSubtle bg-surface p-6">
      <h3 className="mb-4 text-lg font-semibold">
        Reading Material
      </h3>

      {lesson.content.markdown ? (
        lesson.content.markdown.split("\n\n").map((block) => {
          if (block.startsWith("## ")) {
            return (
              <h2
                key={block}
                className="mb-3 text-xl font-semibold"
              >
                {block.replace(/^##\s*/, "")}
              </h2>
            );
          }

          return (
            <p
              key={block}
              className="mb-4 text-textSecondary"
            >
              {block}
            </p>
          );
        })
      ) : (
        <p className="text-textSecondary">
          Lesson content placeholder.
        </p>
      )}
    </div>

    <div className="rounded-xl border border-borderSubtle bg-surface p-5">
      <h3 className="text-lg font-semibold">
        Reading Overview
      </h3>

      <div className="mt-4 space-y-3 text-sm">
        <p className="text-textSecondary">
          {lesson.summary}
        </p>

        <p>
          <span className="text-textMuted">
            Duration:
          </span>{" "}
          {lesson.durationMinutes} min
        </p>

        <p>
          <span className="text-textMuted">
            Module:
          </span>{" "}
          {module.title}
        </p>

        <p>
          <span className="text-textMuted">
            Lesson Type:
          </span>{" "}
          {lesson.kind}
        </p>
      </div>
    </div>

  </div>
)}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={markComplete}
          disabled={completed}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {completed ? "Completed" : "Mark complete"}
        </button>
      </div>

      <div className="mt-10 flex justify-between">
  {previousLesson ? (
    <Link
      href={ROUTES.STUDENT.lesson(
        courseId,
        previousLesson.moduleId,
        previousLesson.lesson.id
      )}
      className="
        rounded-lg
        border
        border-brand/30
        bg-brand/5
        px-4
        py-2
        text-sm
        font-medium
        text-brand
        transition
        hover:border-brand
        hover:bg-brand/10
      "
    >
      ← Previous Lesson
    </Link>
  ) : (
    <div />
  )}

  {nextLesson ? (
    <Link
      href={ROUTES.STUDENT.lesson(
        courseId,
        nextLesson.moduleId,
        nextLesson.lesson.id
      )}
      className="
        rounded-lg
        border
        border-brand/30
        bg-brand/5
        px-4
        py-2
        text-sm
        font-medium
        text-brand
        transition
        hover:border-brand
        hover:bg-brand/10
      "
    >
      Next Lesson →
    </Link>
  ) : null}
</div>
      
      <p className="mt-10 text-xs text-textMuted">
        Educational content only — not investment advice. Always perform your own due diligence.
      </p>
    </LearnShell>
  );
}
