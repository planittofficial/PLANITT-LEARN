"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Users } from "lucide-react";

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
import { useAdminStudents } from "@/hooks/admin/use-admin-students";

export function StudentsAdminView() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminStudents({ page, q: search });

  if (isLoading && !data) return <AdminPageSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <AdminPageHeader
        eyebrow="Learner Roster"
        title="Student Management"
        description="Search enrolled learners, review progress metrics, and inspect quiz performance data."
        icon={Users}
      />

      {/* Search Bar */}
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q);
          setPage(1);
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-textMuted" />
          <input
            className="w-full rounded border border-white/5 bg-[#1C1B1B] py-2.5 pl-10 pr-3 font-mono text-xs text-textPrimary placeholder:text-textMuted outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 uppercase tracking-wide"
            placeholder="SEARCH_BY_NAME_OR_EMAIL"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <AdminButton type="submit">
          <Search className="h-3.5 w-3.5" />
          Execute Search
        </AdminButton>
      </form>

      {error ? (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 font-mono text-xs text-rose-400 uppercase tracking-wider">
          &gt; ERROR: {(error as Error).message}
        </div>
      ) : null}

      <AdminTable>
        <AdminTableElement>
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Name / ID</AdminTableHeaderCell>
              <AdminTableHeaderCell>Email Address</AdminTableHeaderCell>
              <AdminTableHeaderCell>Enrolled Courses</AdminTableHeaderCell>
              <AdminTableHeaderCell>Lessons Done</AdminTableHeaderCell>
              <AdminTableHeaderCell>Quiz Attempts</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {(data?.items ?? []).map((student) => (
              <AdminTableRow key={student.id}>
                <AdminTableCell>
                  <Link
                    href={`/admin/students/${student.id}`}
                    className="font-mono font-bold text-brand hover:underline uppercase tracking-wide"
                  >
                    {student.name ?? student.id}
                  </Link>
                  <p className="mt-0.5 font-mono text-[9px] text-textMuted tracking-widest">{student.id}</p>
                </AdminTableCell>
                <AdminTableCell className="text-textSecondary lowercase tracking-wide">
                  {student.email}
                </AdminTableCell>
                <AdminTableCell>
                  <span className="font-mono font-bold text-textPrimary">{student.enrolledCourseCount}</span>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="font-mono font-bold text-textPrimary">{student.lessonsCompleted}</span>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="font-mono font-bold text-textPrimary">{student.quizAttempts}</span>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTableElement>
      </AdminTable>

      {data ? (
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs uppercase tracking-wider">
          <p className="text-textMuted">
            Page_{data.page} · {data.total} Students_Registered
          </p>
          <div className="flex gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              &lt; Previous
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="sm"
              disabled={page * data.pageSize >= data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next &gt;
            </AdminButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
