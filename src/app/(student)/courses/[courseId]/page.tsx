"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";

import { LearnShell } from "@/components/layout/student";
import { CoursePageSkeleton } from "@/components/ui/skeletons";
import { CourseHubView } from "@/features/course-catalog/components/CourseHubView";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { useCourseDetail } from "@/hooks/courses/use-course-detail";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { apiCourseDetailToDefinition } from "@/lib/catalog/map-api-course";
import { getCourseById } from "@/lib/catalog/courses";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";

export default function CourseHubPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const staticCourse = getCourseById(courseId);
  const courseQuery = useCourseDetail(courseId);
  const { user } = useAuth();
  const { enrolledIds, loading } = useEnrollment();

  const course =
    courseQuery.data && courseQuery.data.modules.length > 0
      ? apiCourseDetailToDefinition(courseQuery.data)
      : staticCourse;

  if (!course && !courseQuery.isLoading) notFound();

  const enrolled = isEnrolledInCourse(enrolledIds, courseId);

  return (
    <LearnShell>
      <Link
        href={ROUTES.STUDENT.HOME}
        className="mb-6 inline-flex text-sm text-textMuted transition hover:text-brand"
      >
        ← Back to dashboard
      </Link>
      {!course || loading || courseQuery.isLoading ? (
        <CoursePageSkeleton />
      ) : (
        <CourseHubView
          course={course}
          courseId={courseId}
          userId={user?.id}
          enrolled={enrolled}
        />
      )}
    </LearnShell>
  );
}
