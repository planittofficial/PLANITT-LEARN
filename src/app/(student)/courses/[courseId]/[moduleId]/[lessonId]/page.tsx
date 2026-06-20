"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { LearnShell } from "@/components/layout/student";
import { LessonPageSkeleton } from "@/components/ui/skeletons";
import { LockedCourseEmpty } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { planittCheckoutUrl } from "@/constants/urls";
import { useAuth } from "@/context/auth-context";
import {
  LessonContent,
  LessonMetaBar,
  LessonNav,
  LessonSidebar,
} from "@/features/lesson-player/components/LessonView";
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
    m.lessons.map((l) => ({ lesson: l, moduleId: m.id })),
  );
  const currentIndex = allLessons.findIndex((item) => item.lesson.id === lesson.id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <LearnShell>
        <LessonPageSkeleton />
      </LearnShell>
    );
  }

  if (!isEnrolledInCourse(enrolledIds, courseId)) {
    return (
      <LearnShell>
        <LockedCourseEmpty
          action={
            <a
              href={planittCheckoutUrl(courseId)}
              className="inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-black"
            >
              Buy course on Planitt →
            </a>
          }
        />
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
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-textMuted">
        <Link href={ROUTES.STUDENT.HOME} className="hover:text-brand">
          Dashboard
        </Link>
        <span>/</span>
        <Link href={ROUTES.STUDENT.course(courseId)} className="hover:text-brand">
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-textSecondary">{lesson.title}</span>
      </nav>

      <p className="text-xs font-medium uppercase tracking-wider text-brand">{module.title}</p>
      <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
      <div className="mt-3">
        <LessonMetaBar lesson={lesson} module={module} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <LessonContent
            lesson={lesson}
            courseId={courseId}
            userId={user?.id}
            onComplete={markComplete}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={markComplete}
              disabled={completed}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
            >
              {completed ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </>
              ) : (
                "Mark as complete"
              )}
            </button>
          </div>
        </div>

        <LessonSidebar
          lesson={lesson}
          module={module}
          course={course}
          progress={progress}
          completed={!!completed}
        />
      </div>

      <LessonNav
        courseId={courseId}
        previous={
          previousLesson
            ? {
                moduleId: previousLesson.moduleId,
                lessonId: previousLesson.lesson.id,
                title: previousLesson.lesson.title,
              }
            : null
        }
        next={
          nextLesson
            ? {
                moduleId: nextLesson.moduleId,
                lessonId: nextLesson.lesson.id,
                title: nextLesson.lesson.title,
              }
            : null
        }
      />

      <p className="mt-8 text-center text-xs text-textMuted">
        Educational content only — not investment advice.
      </p>
    </LearnShell>
  );
}
