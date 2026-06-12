"use client";

import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";

import { LearnShell } from "@/components/layout/LearnShell";
import { useEnrollment } from "@/hooks/useEnrollment";
import { COURSE_CATALOG } from "@/lib/catalog/courses";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { cn } from "@/lib/utils";

export function MyCoursesSection() {
  const { loading, enrolledIds, isAuthenticated } = useEnrollment();

  if (loading) {
    return <p className="text-sm text-textSecondary">Loading your courses…</p>;
  }

  if (!isAuthenticated) {
    return (
      <p className="rounded-xl border border-borderSubtle bg-surface p-6 text-sm text-textSecondary">
        <Link href="/login" className="text-brand hover:underline">
          Sign in
        </Link>{" "}
        to see courses linked to your Planitt account.
      </p>
    );
  }

  const enrolled = COURSE_CATALOG.filter((c) => isEnrolledInCourse(enrolledIds, c.id));
  const catalog = COURSE_CATALOG.filter((c) => !isEnrolledInCourse(enrolledIds, c.id));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">My courses</h2>
        {enrolled.length === 0 ? (
          <p className="rounded-xl border border-dashed border-borderSubtle p-6 text-sm text-textSecondary">
            No enrolled courses yet. Complete checkout on the main Planitt Learn page, then return
            here.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {enrolled.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="rounded-xl border border-brand/30 bg-surface p-5 transition hover:border-brand"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-brand">{course.category}</p>
                    <h3 className="mt-1 font-semibold">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-textSecondary">{course.blurb}</p>
                  </div>
                  <BookOpen className="h-5 w-5 shrink-0 text-brand" />
                </div>
                <p className="mt-4 text-sm font-medium text-brand">Continue learning →</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {catalog.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-textSecondary">Catalog (locked)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {catalog.map((course) => (
              <div
                key={course.id}
                className={cn(
                  "rounded-xl border border-borderSubtle bg-surface/50 p-4 opacity-80",
                )}
              >
                <div className="flex items-center gap-2 text-textMuted">
                  <Lock className="h-4 w-4" />
                  <span className="text-xs uppercase">{course.category}</span>
                </div>
                <h3 className="mt-1 font-medium">{course.title}</h3>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
