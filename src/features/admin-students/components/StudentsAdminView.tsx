"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Users } from "lucide-react";

import {
  AdminButton,
  AdminInput,
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
import { useAdminStudents } from "@/hooks/admin/use-admin-students";

export function StudentsAdminView() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminStudents({ page, q: search });

  if (isLoading && !data) return <AdminPageSkeleton />;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Learners"
        title="Students"
        description="Search enrolled learners, review progress, and inspect quiz performance."
        icon={Users}
      />

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q);
          setPage(1);
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
          <input
            className="w-full rounded-xl border border-borderSubtle bg-black/20 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            placeholder="Search by name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <AdminButton type="submit">Search</AdminButton>
      </form>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-400">
          {(error as Error).message}
        </div>
      ) : null}

      <AdminTable>
        <AdminTableElement>
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Name</AdminTableHeaderCell>
              <AdminTableHeaderCell>Email</AdminTableHeaderCell>
              <AdminTableHeaderCell>Enrolled</AdminTableHeaderCell>
              <AdminTableHeaderCell>Lessons done</AdminTableHeaderCell>
              <AdminTableHeaderCell>Quizzes</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {(data?.items ?? []).map((student) => (
              <AdminTableRow key={student.id}>
                <AdminTableCell>
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="font-medium text-violet-400 hover:underline"
                  >
                    {student.name ?? student.id}
                  </Link>
                </AdminTableCell>
                <AdminTableCell className="text-textSecondary">{student.email}</AdminTableCell>
                <AdminTableCell>{student.enrolledCourseCount}</AdminTableCell>
                <AdminTableCell>{student.lessonsCompleted}</AdminTableCell>
                <AdminTableCell>{student.quizAttempts}</AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTableElement>
      </AdminTable>

      {data ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-textSecondary">
            Page {data.page} · {data.total} students
          </p>
          <div className="flex gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="sm"
              disabled={page * data.pageSize >= data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </AdminButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
