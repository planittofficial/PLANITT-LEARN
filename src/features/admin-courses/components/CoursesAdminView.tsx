"use client";

import Link from "next/link";
import { BookOpen, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import {
  AdminButton,
  AdminPageHeader,
  AdminPageSkeleton,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableElement,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from "@/features/admin-ui";
import { useAdminCourses, useDeleteCourse } from "@/hooks/admin/use-admin-courses";

export function CoursesAdminView() {
  const { data: courses, isLoading, error } = useAdminCourses();
  const deleteCourse = useDeleteCourse();

  if (isLoading) return <AdminPageSkeleton />;
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-400">
        {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Content"
        title="Courses"
        description="Create and publish learning paths, modules, and lessons for students."
        icon={BookOpen}
        action={
          <Link href="/admin/courses/new">
            <AdminButton>
              <Plus className="h-4 w-4" />
              Add course
            </AdminButton>
          </Link>
        }
      />

      <AdminTable>
        <AdminTableElement>
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Title</AdminTableHeaderCell>
              <AdminTableHeaderCell>Modules</AdminTableHeaderCell>
              <AdminTableHeaderCell>Lessons</AdminTableHeaderCell>
              <AdminTableHeaderCell>Status</AdminTableHeaderCell>
              <AdminTableHeaderCell>Actions</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {(courses ?? []).map((course) => (
              <AdminTableRow key={course.id}>
                <AdminTableCell>
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="font-medium text-violet-400 hover:underline"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-0.5 font-mono text-xs text-textMuted">{course.id}</p>
                </AdminTableCell>
                <AdminTableCell>{course.moduleCount}</AdminTableCell>
                <AdminTableCell>{course.lessonCount}</AdminTableCell>
                <AdminTableCell>
                  <Badge variant={course.published ? "success" : "warning"}>
                    {course.published ? "Published" : "Draft"}
                  </Badge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/courses/${course.id}/edit`}>
                      <AdminButton variant="secondary" size="sm">
                        Edit
                      </AdminButton>
                    </Link>
                    <AdminButton
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete ${course.title}?`)) deleteCourse.mutate(course.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </AdminButton>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTableElement>
      </AdminTable>

      {(courses ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borderSubtle px-6 py-12 text-center text-sm text-textMuted">
          No courses yet.{" "}
          <Link href="/admin/courses/new" className="text-violet-400 hover:underline">
            Create your first course
          </Link>
        </div>
      ) : null}
    </div>
  );
}
