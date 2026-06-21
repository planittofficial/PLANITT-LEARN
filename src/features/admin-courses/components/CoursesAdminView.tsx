"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { useAdminCourses, useDeleteCourse } from "@/hooks/admin/use-admin-courses";

export function CoursesAdminView() {
  const { data: courses, isLoading, error } = useAdminCourses();
  const deleteCourse = useDeleteCourse();

  if (isLoading) return <p className="text-textSecondary">Loading courses…</p>;
  if (error) return <p className="text-danger">{(error as Error).message}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          Add course
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-borderSubtle">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-borderSubtle bg-surface text-textSecondary">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Modules</th>
              <th className="px-4 py-3">Lessons</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(courses ?? []).map((course) => (
              <tr key={course.id} className="border-b border-borderSubtle/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/courses/${course.id}`} className="font-medium text-brand hover:underline">
                    {course.title}
                  </Link>
                  <p className="text-xs text-textMuted">{course.id}</p>
                </td>
                <td className="px-4 py-3">{course.moduleCount}</td>
                <td className="px-4 py-3">{course.lessonCount}</td>
                <td className="px-4 py-3">{course.published ? "Published" : "Draft"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/courses/${course.id}/edit`} className="text-sm text-brand">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="text-sm text-danger"
                      onClick={() => {
                        if (confirm(`Delete ${course.title}?`)) deleteCourse.mutate(course.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
