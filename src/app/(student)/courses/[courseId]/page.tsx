"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";

import { LearnShell } from "@/components/layout/student";
import { CourseHubView } from "@/features/course-catalog/components/CourseHubView";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { getCourseById } from "@/lib/catalog/courses";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";

export default function CourseHubPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const course = getCourseById(courseId);
  const { user } = useAuth();
  const { enrolledIds, loading } = useEnrollment();

  if (!course) notFound();

  const enrolled = isEnrolledInCourse(enrolledIds, courseId);

  return (
    <LearnShell>
      <Link
        href={ROUTES.STUDENT.HOME}
        className="mb-6 inline-flex text-sm text-textMuted transition hover:text-brand"
      >
        ← Back to dashboard
      </Link>
      <CourseHubView
        course={course}
        courseId={courseId}
        userId={user?.id}
        enrolled={enrolled}
        loading={loading}
      />
    </LearnShell>
  );
}
