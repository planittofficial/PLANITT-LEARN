"use client";

import Link from "next/link";
import { BookOpen, Mail, Target, TrendingUp, CheckCircle2, Clock, Activity } from "lucide-react";

import {
  AdminCard,
  AdminPageHeader,
  AdminPageSkeleton,
  AdminSection,
  AdminStatCard,
} from "@/features/admin-ui";
import { useAdminStudent } from "@/hooks/admin/use-admin-students";
import { ROUTES } from "@/constants/routes";
import { COURSE_CATALOG, countCourseLessons } from "@/lib/catalog/courses";

export function StudentDetailAdminView({ userId }: { userId: string }) {
  const { data: student, isLoading, error } = useAdminStudent(userId);

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
        <div className="w-full h-2 bg-white/5 rounded overflow-hidden mb-2">
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
            <div key={e.courseId} className="flex items-center justify-between rounded-lg border border-white/5 bg-[#131313]/60 px-5 py-4 font-mono text-xs hover:border-brand/30 transition">
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
              className="flex items-center justify-between rounded-lg border border-white/5 bg-[#131313]/60 px-5 py-3.5 hover:border-brand/20 transition"
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
              className="flex items-center justify-between rounded-lg border border-white/5 bg-[#131313]/60 px-5 py-3.5 hover:border-brand/20 transition"
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
