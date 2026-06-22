"use client";

import { BarChart3, BookOpen, CheckCircle2, Target, Users } from "lucide-react";

import {
  AdminCard,
  AdminPageHeader,
  AdminPageSkeleton,
  AdminSection,
  AdminStatCard,
} from "@/features/admin-ui";
import { useAdminAnalytics } from "@/hooks/admin/use-admin-analytics";

export function AnalyticsAdminView() {
  const { data, isLoading, error } = useAdminAnalytics();

  if (isLoading) return <AdminPageSkeleton />;
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-400">
        {(error as Error).message}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Insights"
        title="Platform analytics"
        description="Enrollment trends, quiz performance, and recent learning activity."
        icon={BarChart3}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total users" value={data.totalStudents} icon={Users} accent="violet" />
        <AdminStatCard label="Quiz attempts" value={data.quizAttempts} icon={Target} accent="indigo" />
        <AdminStatCard label="Quiz pass rate" value={`${data.quizPassRate}%`} icon={CheckCircle2} accent="emerald" />
        <AdminStatCard label="Completed lessons" value={data.completedLessons} icon={BookOpen} accent="sky" />
      </div>

      <AdminSection title="Most popular courses">
        <div className="space-y-2">
          {data.popularCourses.map((course) => (
            <AdminCard
              key={course.courseId}
              className="flex items-center justify-between !p-4 text-sm"
            >
              <span className="font-medium">{course.title}</span>
              <span className="text-violet-400">{course.enrollmentCount} enrollments</span>
            </AdminCard>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="Recent learning activity">
        <div className="space-y-2">
          {data.recentActivity.map((item, i) => (
            <AdminCard key={`${item.userId}-${item.lessonId}-${i}`} className="!p-4 text-sm">
              <p className="font-medium">
                {item.name} — {item.lessonTitle}
              </p>
              <p className="mt-1 text-xs text-textMuted">
                {item.completed ? "Completed" : "In progress"} ·{" "}
                {new Date(item.lastWatchedAt).toLocaleString()}
              </p>
            </AdminCard>
          ))}
        </div>
      </AdminSection>
    </div>
  );
}
