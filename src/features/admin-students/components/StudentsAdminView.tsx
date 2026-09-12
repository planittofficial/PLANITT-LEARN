"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Search, Users } from "lucide-react";

import {
  AdminButton,
  AdminCard,
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
import { useAdminStudents, useGrantSubscriptions } from "@/hooks/admin/use-admin-students";
import type { SubscriptionStatus } from "@/types/admin.types";

const statusStyles: Record<SubscriptionStatus, string> = {
  active: "border-brand/25 bg-brand/10 text-brand",
  expiring_soon: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  expired: "border-rose-500/25 bg-rose-500/10 text-rose-400",
  none: "border-white/10 bg-white/5 text-textMuted",
};

function SubscriptionPill({ status, expiresAt }: { status: SubscriptionStatus; expiresAt: string | null }) {
  const label = status === "expiring_soon" ? "Expiring soon" : status === "none" ? "No subscription" : status[0].toUpperCase() + status.slice(1);
  return <div><span className={`inline-flex rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${statusStyles[status]}`}>{label}</span>{expiresAt ? <p className="mt-1 font-mono text-[9px] text-textMuted">{new Date(expiresAt).toLocaleDateString()}</p> : null}</div>;
}

export function StudentsAdminView() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminStudents({ page, q: search });
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<"days" | "date">("days");
  const [days, setDays] = useState("30");
  const [date, setDate] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const grant = useGrantSubscriptions();
  const visibleIds = (data?.items ?? []).map((student) => student.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const applyGrant = () => {
    setFeedback(null);
    grant.mutate({ userIds: selected, mode, ...(mode === "days" ? { days: Number(days) } : { date }) }, {
      onSuccess: (result) => { setFeedback(`${result.updated} subscription${result.updated === 1 ? "" : "s"} updated`); setSelected([]); },
      onError: (err) => setFeedback(err.message),
    });
  };

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
            className="w-full rounded border border-borderSubtle bg-elevated py-2.5 pl-10 pr-3 font-mono text-xs text-textPrimary placeholder:text-textMuted outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 uppercase tracking-wide"
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

      {feedback ? <div className={`rounded-lg border p-3 font-mono text-xs uppercase tracking-wider ${feedback.includes("updated") ? "border-brand/20 bg-brand/5 text-brand" : "border-rose-500/20 bg-rose-500/10 text-rose-400"}`}>{feedback.includes("updated") ? <Check className="mr-2 inline h-3.5 w-3.5" /> : null}{feedback}</div> : null}

      {selected.length ? <AdminCard className="border-brand/30 bg-brand/5"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand">{selected.length} learner{selected.length === 1 ? "" : "s"} selected</p><p className="mt-1 text-xs text-textSecondary">Apply one access change to the current selection.</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="flex rounded border border-white/10 p-0.5 font-mono text-[10px] uppercase"><button type="button" onClick={() => setMode("days")} className={`px-3 py-2 ${mode === "days" ? "bg-brand text-brandForeground" : "text-textMuted"}`}>Add days</button><button type="button" onClick={() => setMode("date")} className={`px-3 py-2 ${mode === "date" ? "bg-brand text-brandForeground" : "text-textMuted"}`}>Set date</button></div>{mode === "days" ? <AdminInput aria-label="Days to add" type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} className="w-28 font-mono" /> : <AdminInput aria-label="Subscription expiry date" type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="font-mono" />}<AdminButton onClick={applyGrant} disabled={grant.isPending}>{grant.isPending ? "Updating..." : "Apply access"}</AdminButton></div></div></AdminCard> : null}

      <AdminTable>
        <AdminTableElement>
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell className="w-12"><input aria-label="Select all visible students" type="checkbox" checked={allSelected} onChange={(e) => setSelected(e.target.checked ? visibleIds : [])} className="accent-brand" /></AdminTableHeaderCell>
              <AdminTableHeaderCell>Name / ID</AdminTableHeaderCell>
              <AdminTableHeaderCell>Email Address</AdminTableHeaderCell>
              <AdminTableHeaderCell>Enrolled Courses</AdminTableHeaderCell>
              <AdminTableHeaderCell>Lessons Done</AdminTableHeaderCell>
              <AdminTableHeaderCell>Quiz Attempts</AdminTableHeaderCell>
              <AdminTableHeaderCell>Subscription</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {(data?.items ?? []).map((student) => (
              <AdminTableRow key={student.id}>
                <AdminTableCell><input aria-label={`Select ${student.name ?? student.email}`} type="checkbox" checked={selected.includes(student.id)} onChange={(e) => setSelected((current) => e.target.checked ? [...current, student.id] : current.filter((id) => id !== student.id))} className="accent-brand" /></AdminTableCell>
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
                <AdminTableCell><SubscriptionPill {...student.subscription} /></AdminTableCell>
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
