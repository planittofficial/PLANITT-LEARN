"use client";

import Link from "next/link";
import { BookOpen, Plus, Trash2, Eye } from "lucide-react";

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
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-6 font-mono text-xs text-rose-400 uppercase tracking-wider">
        &gt; ERROR: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <AdminPageHeader
        eyebrow="Content Library"
        title="Course Management"
        description="Create and publish learning paths, modules, and lessons for the trading curriculum."
        icon={BookOpen}
        action={
          <Link href="/admin/courses/new">
            <AdminButton>
              <Plus className="h-3.5 w-3.5" />
              New Course
            </AdminButton>
          </Link>
        }
      />

      <AdminTable>
        <AdminTableElement>
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Course Title</AdminTableHeaderCell>
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
                    className="font-mono font-bold text-brand hover:underline uppercase tracking-wide"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-0.5 font-mono text-[9px] text-textMuted uppercase tracking-widest">{course.id}</p>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="font-mono font-bold text-textPrimary">{course.moduleCount}</span>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="font-mono font-bold text-textPrimary">{course.lessonCount}</span>
                </AdminTableCell>
                <AdminTableCell>
                  <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider border ${course.published ? "border-brand/20 bg-brand/5 text-brand" : "border-amber-500/20 bg-amber-500/5 text-amber-400"}`}>
                    {course.published ? "PUBLISHED" : "DRAFT"}
                  </span>
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
                      <Trash2 className="h-3 w-3" />
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
        <div className="rounded-lg border border-dashed border-white/10 px-6 py-12 text-center font-mono text-xs text-textMuted uppercase tracking-wider">
          No courses loaded.{" "}
          <Link href="/admin/courses/new" className="text-brand hover:underline font-bold">
            [Create First Course]
          </Link>
        </div>
      ) : null}
    </div>
  );
}
