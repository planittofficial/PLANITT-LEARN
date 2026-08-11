"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Suspense } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CoursePageSkeleton } from "@/components/ui/skeletons";
import { CourseHubView } from "@/features/course-catalog/components/CourseHubView";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { usePurchasedEnrollmentRefresh } from "@/hooks/enrollment/use-purchased-enrollment-refresh";
import { apiCourseDetailToDefinition } from "@/lib/catalog/map-api-course";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";

function CourseHubContent() {
  const params = useParams<{ courseId: string }>();
  const courseId = decodeURIComponent(params.courseId ?? "");
  const courseQuery = useCourseDetail(courseId);
  const { user } = useAuth();
  const { enrolledIds, loading } = useEnrollment();
  usePurchasedEnrollmentRefresh();

  const course = courseQuery.data ? apiCourseDetailToDefinition(courseQuery.data) : null;
  const enrolled = isEnrolledInCourse(enrolledIds, courseId);
  const isLoading = loading || courseQuery.isPending || !courseQuery.isFetched;

  if (!isLoading && courseQuery.isError) {
    const message =
      courseQuery.error instanceof Error && courseQuery.error.message === "NOT_ENROLLED"
        ? "You are not enrolled in this course yet. Purchase access on the main Alvest site, then return here."
        : courseQuery.error instanceof Error && courseQuery.error.message === "SERVER_ERROR"
          ? "Could not load course content due to a server error."
          : "Could not load course content. Please try again shortly.";
    return (
      <>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: ROUTES.STUDENT.HOME },
            { label: courseId },
          ]}
        />
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-6 text-sm text-amber-200">
          {message}{" "}
          <button
            type="button"
            className="text-brand underline"
            onClick={() => void courseQuery.refetch()}
          >
            Try again
          </button>{" "}
          or{" "}
          <Link href={ROUTES.STUDENT.HOME} className="text-brand underline">
            return home
          </Link>
          .
        </div>
      </>
    );
  }

  if (!isLoading && !course) {
    notFound();
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Dashboard", href: ROUTES.STUDENT.HOME },
          { label: course?.title ?? courseId },
        ]}
      />
      {isLoading || !course ? (
        <CoursePageSkeleton />
      ) : (
        <CourseHubView
          course={course}
          courseId={courseId}
          userId={user?.id}
          enrolled={enrolled}
        />
      )}
    </>
  );
}

export default function CourseHubPage() {
  return (
    <Suspense fallback={<CoursePageSkeleton />}>
      <CourseHubContent />
    </Suspense>
  );
}
