"use client";

import { BarChart3, BookOpen, CheckCircle2, Target, Users, Activity, TrendingUp } from "lucide-react";

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
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-6 font-mono text-xs text-rose-400 uppercase tracking-wider">
        &gt; ERROR: {(error as Error).message}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in">
      <AdminPageHeader
        eyebrow="Platform Insights"
        title="Analytics Suite"
        description="Enrollment trends, quiz pass rates, and real-time learning activity across all students."
        icon={BarChart3}
      />

      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total Users" value={data.totalStudents} icon={Users} accent="violet" />
        <AdminStatCard label="Quiz Attempts" value={data.quizAttempts} icon={Target} accent="indigo" />
        <AdminStatCard label="Quiz Pass Rate" value={`${data.quizPassRate}%`} icon={CheckCircle2} accent="emerald" />
        <AdminStatCard label="Lessons Completed" value={data.completedLessons} icon={BookOpen} accent="sky" />
      </div>

      {/* Popular Courses */}
      <AdminSection title="Most Active Courses">
        <div className="space-y-3">
          {data.popularCourses.map((course, index) => (
            <div
              key={course.courseId}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-[#131313]/60 px-5 py-4 font-mono text-xs hover:border-brand/30 transition"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-[9px] text-brand/60 font-bold uppercase tracking-widest w-5 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-bold text-textPrimary uppercase tracking-wide truncate">{course.title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <TrendingUp className="h-3.5 w-3.5 text-brand" />
                <span className="font-bold text-brand tracking-widest uppercase">{course.enrollmentCount} Enrolled</span>
              </div>
            </div>
          ))}
        </div>
      </AdminSection>

      {/* Recent Activity Feed */}
      <AdminSection title="Recent Learning Activity">
        <div className="space-y-2">
          {data.recentActivity.map((item, i) => (
            <div
              key={`${item.userId}-${item.lessonId}-${i}`}
              className="flex items-start gap-4 rounded-lg border border-white/5 bg-[#131313]/60 px-5 py-4 hover:border-brand/20 transition"
            >
              {/* Status dot */}
              <div className="mt-1 shrink-0">
                <div className={`w-2 h-2 rounded-full ${item.completed ? "bg-brand animate-pulse" : "bg-amber-400"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono font-bold text-xs text-textPrimary uppercase tracking-wide truncate">
                  {item.name} — <span className="text-brand">{item.lessonTitle}</span>
                </p>
                <p className="mt-1 font-mono text-[9px] text-textMuted uppercase tracking-widest">
                  {item.completed ? "LESSON_COMPLETED" : "IN_PROGRESS"} · {new Date(item.lastWatchedAt).toLocaleString()}
                </p>
              </div>
              <div className="shrink-0 font-mono text-[9px] text-textMuted uppercase tracking-widest">
                {item.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                ) : (
                  <Activity className="h-4 w-4 text-amber-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </AdminSection>
    </div>
  );
}
