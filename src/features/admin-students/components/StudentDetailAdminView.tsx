"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, CalendarClock, Mail, Target, TrendingUp, CheckCircle2, Activity } from "lucide-react";

import {
  AdminCard,
  AdminPageHeader,
  AdminPageSkeleton,
  AdminSection,
  AdminStatCard,
  AdminButton,
  AdminInput,
} from "@/features/admin-ui";
import { useAdminStudent, useGrantSubscriptions } from "@/hooks/admin/use-admin-students";
import { ROUTES } from "@/constants/routes";
import { COURSE_CATALOG, countCourseLessons } from "@/lib/catalog/courses";

export function StudentDetailAdminView({ userId }: { userId: string }) {
  const { data: student, isLoading, error } = useAdminStudent(userId);
  const grant = useGrantSubscriptions();
  const [mode, setMode] = useState<"days" | "date">("days");
  const [days, setDays] = useState("30");
  const [date, setDate] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (isLoading) return <AdminPageSkeleton />;
  if (error) {
    return (
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-6 font-mono text-xs text-rose-400 uppercase tracking-wider">
        &gt; ERROR: {(error as Error).message}
      </div>
    );
  }
  if (!student) return (
    <p className="font-mono text-xs text-textMuted uppercase tracking-wider">STUDENT_NOT_FOUND</p>
  );

  const totalLessons = student.enrollments.reduce((sum, e) => {
    const course = COURSE_CATALOG.find((c) => c.id === e.courseId);
    return sum + (course ? countCourseLessons(course) : 0);
  }, 0);

  const progressPercent =
    totalLessons > 0
      ? Math.round((student.lessonsCompleted / totalLessons) * 100)
      : 0;

  const statusLabel = student.subscription.status === "expiring_soon" ? "Expiring soon" : student.subscription.status === "none" ? "No subscription" : student.subscription.status[0].toUpperCase() + student.subscription.status.slice(1);
  const statusClass = student.subscription.status === "active" ? "text-brand border-brand/25 bg-brand/10" : student.subscription.status === "expiring_soon" ? "text-amber-400 border-amber-500/25 bg-amber-500/10" : student.subscription.status === "expired" ? "text-rose-400 border-rose-500/25 bg-rose-500/10" : "text-textMuted border-white/10 bg-white/5";
  const applyGrant = () => {
    setFeedback(null);
    grant.mutate({ userIds: [student.id], mode, ...(mode === "days" ? { days: Number(days) } : { date }) }, {
      onSuccess: () => setFeedback("Subscription updated"),
      onError: (err) => setFeedback(err.message),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <Link
        href={ROUTES.ADMIN.STUDENTS}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] text-brand hover:underline uppercase tracking-widest"
      >
        ← Back to Student Roster
      </Link>

      <AdminPageHeader
        eyebrow="Student Profile"
        title={student.name ?? student.id}
        description={student.email}
        icon={Mail}
      />

      <AdminCard highlight>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-brand"><CalendarClock className="h-3.5 w-3.5" /> Subscription access</p>
            <div className="mt-2 flex flex-wrap items-center gap-3"><span className={`rounded border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${statusClass}`}>{statusLabel}</span>{student.subscription.expiresAt ? <span className="font-mono text-[10px] text-textMuted">Expires {new Date(student.subscription.expiresAt).toLocaleDateString()}</span> : null}</div>
            {feedback ? <p className={`mt-2 font-mono text-[10px] uppercase tracking-wider ${feedback.includes("updated") ? "text-brand" : "text-rose-400"}`}>{feedback}</p> : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="flex rounded border border-white/10 p-0.5 font-mono text-[10px] uppercase"><button type="button" onClick={() => setMode("days")} className={`px-3 py-2 ${mode === "days" ? "bg-brand text-brandForeground" : "text-textMuted"}`}>Add days</button><button type="button" onClick={() => setMode("date")} className={`px-3 py-2 ${mode === "date" ? "bg-brand text-brandForeground" : "text-textMuted"}`}>Set date</button></div>{mode === "days" ? <AdminInput aria-label="Days to add" type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} className="w-28 font-mono" /> : <AdminInput aria-label="Subscription expiry date" type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} className="font-mono" />}<AdminButton onClick={applyGrant} disabled={grant.isPending}>{grant.isPending ? "Updating..." : "Update access"}</AdminButton></div>
        </div>
      </AdminCard>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="Enrolled Courses"
          value={student.enrolledCourseCount}
          icon={BookOpen}
          accent="violet"
        />
        <AdminStatCard
          label="Lessons Completed"
          value={student.lessonsCompleted}
          icon={TrendingUp}
          accent="emerald"
        />
        <AdminStatCard
          label="Overall Progress"
          value={`${progressPercent}%`}
          icon={Target}
          accent="indigo"
        />
      </div>

      {/* Progress bar */}
      <AdminCard>
        <p className="font-mono text-[9px] text-textMuted uppercase tracking-widest mb-3">Learning_Progress_Matrix</p>
        <div className="w-full h-2 bg-overlay-subtle rounded overflow-hidden mb-2">
          <div className="h-full bg-brand transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between font-mono text-[10px] text-textMuted uppercase tracking-wider">
          <span>{progressPercent}% Completed</span>
          <span>{student.lessonsCompleted} / {totalLessons} Nodes</span>
        </div>
      </AdminCard>

      {/* Enrollments */}
      <AdminSection title="Course Enrollments">
        <div className="space-y-2">
          {student.enrollments.map((e) => (
            <div key={e.courseId} className="flex items-center justify-between rounded-lg border border-borderSubtle bg-surface/80 px-5 py-4 font-mono text-xs hover:border-brand/30 transition">
              <div className="min-w-0">
                <p className="font-bold text-textPrimary uppercase tracking-wide truncate">{e.courseTitle}</p>
                <p className="text-[9px] text-textMuted uppercase tracking-widest mt-1">
                  Enrolled: {new Date(e.enrolledAt).toLocaleDateString()}
                </p>
              </div>
              <span className="font-mono text-[9px] text-brand border border-brand/20 bg-brand/5 px-2 py-0.5 rounded uppercase tracking-widest font-bold shrink-0 ml-4">
                ACTIVE
              </span>
            </div>
          ))}
        </div>
      </AdminSection>

      {/* Lesson Progress */}
      <AdminSection title="Lesson Progress Feed">
        <div className="space-y-2">
          {student.progress.map((p) => (
            <div
              key={p.lessonId}
              className="flex items-center justify-between rounded-lg border border-borderSubtle bg-surface/80 px-5 py-3.5 hover:border-brand/20 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">
                  {p.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                  ) : (
                    <Activity className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <p className="font-mono text-xs font-bold text-textPrimary uppercase tracking-wide truncate">{p.lessonTitle}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="font-mono text-[9px] text-textMuted uppercase tracking-wider">{p.watchPercent}% watched</span>
                <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${p.completed ? "border-brand/20 bg-brand/5 text-brand" : "border-amber-500/20 bg-amber-500/5 text-amber-400"}`}>
                  {p.completed ? "DONE" : "IN_PROGRESS"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AdminSection>

      {/* Quiz Results */}
      <AdminSection title="Quiz Score History">
        <div className="space-y-2">
          {student.quizResults.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between rounded-lg border border-borderSubtle bg-surface/80 px-5 py-3.5 hover:border-brand/20 transition"
            >
              <p className="font-mono text-xs font-bold text-textPrimary uppercase tracking-wide capitalize">{q.type} Quiz</p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-textMuted">{q.score} / {q.maxScore} pts</span>
                <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${q.passed ? "border-brand/20 bg-brand/5 text-brand" : "border-rose-500/20 bg-rose-500/5 text-rose-400"}`}>
                  {q.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AdminSection>
    </div>
  );
}
