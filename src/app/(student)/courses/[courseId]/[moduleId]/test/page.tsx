"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LockedCourseEmpty, EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { alvestCheckoutUrl } from "@/constants/urls";
import { useAuth } from "@/context/auth-context";
import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { useModuleTest } from "@/hooks/quizzes/use-module-test";
import { apiCourseDetailToDefinition } from "@/lib/catalog/map-api-course";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { LessonQuizPanel } from "@/features/quizzes";

export default function ModuleTestPage() {
  const params = useParams<{ courseId: string; moduleId: string }>();
  const courseId = decodeURIComponent(params.courseId ?? "");
  const moduleId = decodeURIComponent(params.moduleId ?? "");

  const { user } = useAuth();
  const { enrolledIds, loading } = useEnrollment();
  const courseQuery = useCourseDetail(courseId);
  const moduleTest = useModuleTest(moduleId, Boolean(user?.id));

  const course = courseQuery.data ? apiCourseDetailToDefinition(courseQuery.data) : null;

  if (loading || courseQuery.isLoading) {
    return (
        <div className="flex items-center justify-center py-16 text-textSecondary">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading…
        </div>
    );
  }

  const enrolled = isEnrolledInCourse(enrolledIds, courseId);
  if (!enrolled) {
    return (
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
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: ROUTES.STUDENT.HOME },
          { label: course?.title ?? courseId, href: ROUTES.STUDENT.course(courseId) },
          { label: "Module test" },
        ]}
      />

      {!moduleTest.isLoading && !moduleTest.test ? (
        <EmptyState
          icon={GraduationCap}
          title="Module test not available"
          description="No module test is available for this module yet. Check back after the assessment has been added."
          action={
            <Link
              href={ROUTES.STUDENT.course(courseId)}
              className="inline-flex rounded-xl border border-borderSubtle bg-surface px-4 py-2 text-sm font-medium text-textSecondary hover:border-brand/30 hover:text-brand"
            >
              Back to course
            </Link>
          }
        />
      ) : moduleTest.test ? (
        <LessonQuizPanel
          quiz={{
            ...moduleTest.test,
            title: moduleTest.test.title?.trim() || "Module test",
          }}
          onSubmit={moduleTest.submitTest}
          isSubmitting={moduleTest.isSubmitting}
          result={moduleTest.result}
        />
      ) : (
        <div className="flex items-center justify-center py-16 text-textSecondary">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading test…
        </div>
      )}
    </>
  );
}

