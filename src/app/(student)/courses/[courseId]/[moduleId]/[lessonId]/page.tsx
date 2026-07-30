"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LessonPageSkeleton } from "@/components/ui/skeletons";
import { LockedCourseEmpty } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { alvestCheckoutUrl } from "@/constants/urls";
import { useAuth } from "@/context/auth-context";
import {
  LessonContent,
  LessonMetaBar,
  LessonNav,
  LessonSidebar,
} from "@/features/lesson-player/components/LessonView";
import { LessonBookmarkButton } from "@/features/lesson-player/components/LessonBookmark";
import { LessonQuizPanel } from "@/features/quizzes";
import { useGamification } from "@/features/gamification";
import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { useCourseProgress } from "@/hooks/progress/use-course-progress";
import { useLessonQuiz } from "@/hooks/quizzes/use-lesson-quiz";
import { apiCourseDetailToDefinition } from "@/lib/catalog/map-api-course";
import { getCourseById, getLessonByPath } from "@/lib/catalog/courses";
import type { CourseDefinition, CourseModule, Lesson } from "@/lib/catalog/courses";
import { recordRecentlyWatched } from "@/lib/learning/activity";
import { recordLearningActivity, touchDailyActivity, loadGamification } from "@/lib/learning/gamification";
import { syncAchievements } from "@/lib/learning/achievements";
import {
  checkLevelUpNotification,
  notifyLessonComplete,
  syncNotifications,
} from "@/lib/learning/notifications";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import type { ApiLesson } from "@/types/course.types";

function mapApiLesson(lesson: ApiLesson): Lesson {
  return {
    id: lesson.id,
    title: lesson.title,
    durationMinutes: lesson.durationMinutes,
    kind: lesson.kind,
    summary: lesson.summary,
    content: {
      markdown: lesson.content.markdown,
      videoUrl: lesson.content.videoUrl,
      externalUrl: lesson.content.externalUrl,
    },
  };
}

export default function LessonPage() {
  const params = useParams<{ courseId: string; moduleId: string; lessonId: string }>();
  const { courseId, moduleId, lessonId } = params;
  const { user } = useAuth();
  const { enrolledIds, loading } = useEnrollment();
  const courseQuery = useCourseDetail(courseId);
  const {
    progress,
    markLessonComplete,
    isMarking,
    isLoading: progressLoading,
  } = useCourseProgress(courseId);
  const lessonQuiz = useLessonQuiz(lessonId, Boolean(user?.id));
  const gamification = useGamification(user?.id);

  useEffect(() => {
    if (!user?.id) return;
    touchDailyActivity(user.id);

    const fallback = getLessonByPath(courseId, moduleId, lessonId);
    const apiMod = courseQuery.data?.modules.find((m) => m.id === moduleId);
    const apiLesson = apiMod?.lessons.find((l) => l.id === lessonId);
    const courseTitle = courseQuery.data?.title ?? fallback?.course.title;
    const lessonTitle = apiLesson?.title ?? fallback?.lesson.title;
    const kind = apiLesson?.kind ?? fallback?.lesson.kind ?? "article";

    if (courseTitle && lessonTitle) {
      recordRecentlyWatched(user.id, {
        courseId,
        courseTitle,
        moduleId,
        lessonId,
        lessonTitle,
        kind,
      });
    }
  }, [courseId, moduleId, lessonId, user?.id, courseQuery.data]);

  if (!courseId || !moduleId || !lessonId) {
    return (
      <>
        <LessonPageSkeleton />
      </>
    );
  }

  if (loading || courseQuery.isLoading || progressLoading) {
    return (
      <>
        <LessonPageSkeleton />
      </>
    );
  }

  // Enrollment gate (fast client-side check) — API also enforces enrollment.
  if (!isEnrolledInCourse(enrolledIds, courseId)) {
    return (
      <>
        <LockedCourseEmpty
          action={
            <a
              href={alvestCheckoutUrl(courseId)}
              className="inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground transition hover:bg-brandHover"
            >
              Buy course on Alvest →
            </a>
          }
        />
      </>
    );
  }

  // Prefer API course tree (DB-backed) so admin video edits reflect immediately.
  // Fall back to static catalog when API isn't available or doesn't include this lesson.
  const apiCourse = courseQuery.data;
  const fallback = getLessonByPath(courseId, moduleId, lessonId);
  const staticCourse = getCourseById(courseId);
  if (!apiCourse && !fallback && !staticCourse) notFound();

  const course =
    apiCourse && apiCourse.modules.length > 0
      ? apiCourseDetailToDefinition(apiCourse)
      : (staticCourse ?? fallback!.course);

  const apiLesson = apiCourse?.modules
    .find((m) => m.id === moduleId)
    ?.lessons.find((l) => l.id === lessonId);

  let module: CourseModule | undefined = course.modules.find((m) => m.id === moduleId);
  let lesson: Lesson | undefined = module?.lessons.find((l) => l.id === lessonId);

  if (apiLesson) {
    lesson = mapApiLesson(apiLesson);
  }

  if ((!module || !lesson) && fallback) {
    module = fallback.module;
    lesson = apiLesson ? mapApiLesson(apiLesson) : fallback.lesson;
  }

  if (!module || !lesson) notFound();

  const navCourse =
    staticCourse && staticCourse.modules.length > course.modules.length ? staticCourse : course;

  const allLessons = navCourse.modules.flatMap((m) =>
    m.lessons.map((l) => ({ lesson: l, moduleId: m.id })),
  );
  const currentIndex = allLessons.findIndex((item) => item.lesson.id === lesson.id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const completed = progress[lesson.id]?.completed;

  const markComplete = async () => {
    if (!user?.id || completed) return;
    const xpBefore = gamification.xp;
    await markLessonComplete(lesson.id);
    recordLearningActivity(user.id);
    syncAchievements(user.id);
    const xpAfter = loadGamification(user.id).xp;
    checkLevelUpNotification(user.id, xpBefore, xpAfter);
    notifyLessonComplete(
      user.id,
      lesson.title,
      course.title,
      ROUTES.STUDENT.lesson(courseId, moduleId, lesson.id),
    );
    syncNotifications(user.id);
    gamification.refresh();
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: ROUTES.STUDENT.HOME },
          { label: course.title, href: ROUTES.STUDENT.course(courseId) },
          { label: lesson.title },
        ]}
      />

      <section className="border-b border-borderSubtle pb-6 mb-8 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-[1px] bg-brand"></span>
          <span className="font-mono text-[10px] text-brand uppercase tracking-widest font-bold">
            {module.title}
          </span>
        </div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-textPrimary leading-tight">
          {lesson.title}
        </h1>
        <div className="mt-4">
          <LessonMetaBar lesson={lesson} module={module} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <LessonContent
            lesson={lesson}
            courseId={courseId}
            userId={user?.id}
            onComplete={() => void markComplete()}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void markComplete()}
              disabled={completed || isMarking}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground transition hover:bg-brandHover disabled:opacity-50"
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
            {user?.id ? (
              <LessonBookmarkButton
                userId={user.id}
                courseId={courseId}
                courseTitle={course.title}
                moduleId={moduleId}
                lessonId={lesson.id}
                lessonTitle={lesson.title}
              />
            ) : null}
          </div>

          {lessonQuiz.hasQuiz && lessonQuiz.quiz ? (
            <LessonQuizPanel
              quiz={lessonQuiz.quiz}
              onSubmit={lessonQuiz.submitQuiz}
              isSubmitting={lessonQuiz.isSubmitting}
              result={lessonQuiz.result}
            />
          ) : null}
        </div>

        <LessonSidebar
          lesson={lesson}
          module={module}
          course={navCourse}
          courseId={courseId}
          progress={progress}
          completed={!!completed}
          userId={user?.id}
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
    </>
  );
}
