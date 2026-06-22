"use client";

import Link from "next/link";
import { BookOpen, Mail, Target, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  AdminCard,
  AdminPageHeader,
  AdminPageSkeleton,
  AdminSection,
  AdminStatCard,
} from "@/features/admin-ui";
import { useAdminStudent } from "@/hooks/admin/use-admin-students";
import { ROUTES } from "@/constants/routes";

export function StudentDetailAdminView({ userId }: { userId: string }) {
  const { data: student, isLoading, error } = useAdminStudent(userId);

  if (isLoading) return <AdminPageSkeleton />;
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-400">
        {(error as Error).message}
      </div>
    );
  }
  if (!student) return <p>Student not found.</p>;

  const progressPercent =
    student.progress.length > 0
      ? Math.round(
          (student.progress.filter((p) => p.completed).length / student.progress.length) * 100,
        )
      : 0;

  return (
    <div className="space-y-8">
      <Link
        href={ROUTES.ADMIN.STUDENTS}
        className="text-sm text-violet-400 hover:underline"
      >
        ← Back to students
      </Link>

      <AdminPageHeader
        eyebrow="Student profile"
        title={student.name ?? student.id}
        description={student.email}
        icon={Mail}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="Enrolled courses"
          value={student.enrolledCourseCount}
          icon={BookOpen}
          accent="violet"
        />
        <AdminStatCard
          label="Lessons completed"
          value={student.lessonsCompleted}
          icon={TrendingUp}
          accent="emerald"
        />
        <AdminStatCard
          label="Overall progress"
          value={`${progressPercent}%`}
          icon={Target}
          accent="indigo"
        />
      </div>

      <AdminCard>
        <p className="mb-3 text-sm font-medium">Learning progress</p>
        <ProgressBar value={progressPercent} showLabel size="lg" />
      </AdminCard>

      <AdminSection title="Enrollments">
        <div className="space-y-2">
          {student.enrollments.map((e) => (
            <AdminCard key={e.courseId} className="!p-4 text-sm">
              <p className="font-medium">{e.courseTitle}</p>
              <p className="mt-1 text-xs text-textMuted">
                Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
              </p>
            </AdminCard>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="Lesson progress">
        <div className="space-y-2">
          {student.progress.map((p) => (
            <AdminCard
              key={p.lessonId}
              className="flex flex-wrap items-center justify-between gap-3 !p-4 text-sm"
            >
              <span>{p.lessonTitle}</span>
              <div className="flex items-center gap-2">
                <span className="text-textMuted">{p.watchPercent}%</span>
                <Badge variant={p.completed ? "success" : "warning"}>
                  {p.completed ? "Done" : "In progress"}
                </Badge>
              </div>
            </AdminCard>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="Quiz scores">
        <div className="space-y-2">
          {student.quizResults.map((q) => (
            <AdminCard
              key={q.id}
              className="flex items-center justify-between !p-4 text-sm"
            >
              <span className="capitalize">{q.type} quiz</span>
              <Badge variant={q.passed ? "success" : "warning"}>
                {q.score}/{q.maxScore}
              </Badge>
            </AdminCard>
          ))}
        </div>
      </AdminSection>
    </div>
  );
}
