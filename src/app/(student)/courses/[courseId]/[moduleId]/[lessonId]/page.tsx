"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
  LessonHeader,
  LessonMetaBar,
  LessonNav,
  LessonSidebar,
} from "@/features/lesson-player/components/LessonView";
import { LessonOverviewPanel } from "@/features/lesson-player/components/LessonOverviewPanel";
import { lessonHasResources } from "@/features/lesson-player/components/LessonResources";
import { LessonBookmarkButton } from "@/features/lesson-player/components/LessonBookmark";
import { LessonQuizPanel } from "@/features/quizzes";
import { useGamification } from "@/features/gamification";
import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { useCourseProgress } from "@/hooks/progress/use-course-progress";
import { useLessonQuiz } from "@/hooks/quizzes/use-lesson-quiz";
import { apiCourseDetailToDefinition } from "@/lib/catalog/map-api-course";
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
      videoAvailable: lesson.content.videoAvailable ?? lesson.kind === "video",
      externalUrl: lesson.content.externalUrl,
    },
  };
}

export default function LessonPage() {
  const params = useParams<{ courseId: string; moduleId: string; lessonId: string }>();
  const courseId = decodeURIComponent(params.courseId ?? "");
  const moduleId = decodeURIComponent(params.moduleId ?? "");
  const lessonId = decodeURIComponent(params.lessonId ?? "");
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

    const apiMod = courseQuery.data?.modules.find((m) => m.id === moduleId);
    const apiLesson = apiMod?.lessons.find((l) => l.id === lessonId);
    const courseTitle = courseQuery.data?.title;
    const lessonTitle = apiLesson?.title;
    const kind = apiLesson?.kind ?? "article";

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
    return <LessonPageSkeleton />;
  }

  if (loading || courseQuery.isPending || !courseQuery.isFetched || progressLoading) {
    return <LessonPageSkeleton />;
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

  const apiCourse = courseQuery.data;
  if (!apiCourse) {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-6 text-sm text-amber-200">
        Could not load this lesson. Go back to the{" "}
        <Link href={ROUTES.STUDENT.course(courseId)} className="text-brand underline">
          course page
        </Link>{" "}
        and try again.
      </div>
    );
  }

  const apiMod = apiCourse.modules.find((m) => m.id === moduleId);
  const apiLesson = apiMod?.lessons.find((l) => l.id === lessonId);

  if (!apiMod || !apiLesson) {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-6 text-sm text-amber-200">
        This lesson was not found. It may be unpublished or the link is outdated.{" "}
        <Link href={ROUTES.STUDENT.course(courseId)} className="text-brand underline">
          Return to course
        </Link>
      </div>
    );
  }

  const course = apiCourseDetailToDefinition(apiCourse);
  const module = course.modules.find((m) => m.id === moduleId);
  if (!module) {
    return <LessonPageSkeleton />;
  }

  const lesson = mapApiLesson(apiLesson);
  const navCourse = course;

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
      <Link
        href={ROUTES.STUDENT.course(courseId)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand sm:hidden"
      >
        ← Back to course
      </Link>

      <Breadcrumb
        className="hidden sm:block"
        items={[
          { label: "Dashboard", href: ROUTES.STUDENT.HOME },
          { label: course.title, href: ROUTES.STUDENT.course(courseId) },
          { label: module.title, href: ROUTES.STUDENT.course(courseId) },
          { label: lesson.title },
        ]}
      />

      <div className="mt-4 flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="order-2 min-w-0 space-y-6 xl:order-1">
          <LessonHeader lesson={lesson} module={module} courseTitle={course.title} />
          <LessonMetaBar lesson={lesson} module={module} completed={!!completed} />

          <LessonContent
            lesson={lesson}
            courseId={courseId}
            userId={user?.id}
            onComplete={() => void markComplete()}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => void markComplete()}
              disabled={completed || isMarking}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground shadow-card transition hover:bg-brandHover disabled:opacity-50 sm:w-auto"
            >
              {completed ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Marked complete
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

          <LessonOverviewPanel
            lesson={lesson}
            module={module}
            course={navCourse}
            completed={!!completed}
            userId={user?.id}
            hasResources={lessonHasResources(lesson)}
          />

          {lessonQuiz.hasQuiz && lessonQuiz.quiz ? (
            <LessonQuizPanel
              quiz={lessonQuiz.quiz}
              onSubmit={lessonQuiz.submitQuiz}
              isSubmitting={lessonQuiz.isSubmitting}
              result={lessonQuiz.result}
            />
          ) : null}

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
        </div>

        <div className="order-1 xl:order-2">
          <LessonSidebar
            course={navCourse}
            courseId={courseId}
            currentLessonId={lesson.id}
            progress={progress}
          />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-textMuted">
        Educational content only — not investment advice.
      </p>
    </>
  );
}
