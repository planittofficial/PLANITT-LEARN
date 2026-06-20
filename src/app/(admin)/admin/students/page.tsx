"use client";

import Link from "next/link";
import { useState } from "react";

import { useAdminStudents } from "@/hooks/admin/use-admin-students";

export default function Page() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminStudents({ page, q: search });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Students</h1>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q);
          setPage(1);
        }}
      >
        <input
          className="flex-1 rounded-lg border border-borderSubtle bg-surface px-3 py-2 text-sm"
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Search</button>
      </form>

      {isLoading ? <p>Loading…</p> : null}
      {error ? <p className="text-danger">{(error as Error).message}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-borderSubtle">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-borderSubtle bg-surface text-textSecondary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Enrolled</th>
              <th className="px-4 py-3">Lessons done</th>
              <th className="px-4 py-3">Quizzes</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((student) => (
              <tr key={student.id} className="border-b border-borderSubtle/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/students/${student.id}`} className="text-brand hover:underline">
                    {student.name ?? student.id}
                  </Link>
                </td>
                <td className="px-4 py-3">{student.email}</td>
                <td className="px-4 py-3">{student.enrolledCourseCount}</td>
                <td className="px-4 py-3">{student.lessonsCompleted}</td>
                <td className="px-4 py-3">{student.quizAttempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-textSecondary">
            Page {data.page} · {data.total} students
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} className="rounded border border-borderSubtle px-3 py-1 disabled:opacity-40" onClick={() => setPage((p) => p - 1)}>Prev</button>
            <button type="button" disabled={page * data.pageSize >= data.total} className="rounded border border-borderSubtle px-3 py-1 disabled:opacity-40" onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
