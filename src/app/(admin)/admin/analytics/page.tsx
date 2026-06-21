"use client";

import Link from "next/link";
import { useState } from "react";

import { StatCard } from "@/features/admin-dashboard";
import { useAdminAnalytics } from "@/hooks/admin/use-admin-analytics";

export default function Page() {
  const { data, isLoading, error } = useAdminAnalytics();

  if (isLoading) return <p>Loading analytics…</p>;
  if (error) return <p className="text-danger">{(error as Error).message}</p>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={data.totalStudents} />
        <StatCard label="Quiz attempts" value={data.quizAttempts} />
        <StatCard label="Quiz pass rate" value={`${data.quizPassRate}%`} />
        <StatCard label="Completed lessons" value={data.completedLessons} />
      </div>

      <section>
        <h2 className="text-lg font-semibold">Most popular courses</h2>
        <div className="mt-3 space-y-2">
          {data.popularCourses.map((course) => (
            <div key={course.courseId} className="flex justify-between rounded-lg border border-borderSubtle px-4 py-3 text-sm">
              <span>{course.title}</span>
              <span className="text-textSecondary">{course.enrollmentCount} enrollments</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Recent learning activity</h2>
        <div className="mt-3 space-y-2">
          {data.recentActivity.map((item, i) => (
            <div key={`${item.userId}-${item.lessonId}-${i}`} className="rounded-lg border border-borderSubtle px-4 py-3 text-sm">
              <p>{item.name} — {item.lessonTitle}</p>
              <p className="text-xs text-textMuted">{item.completed ? "Completed" : "In progress"} · {new Date(item.lastWatchedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
