"use client";

import { useQuery } from "@tanstack/react-query";

import { StatCard } from "@/features/admin-dashboard/components/StatCard";
import { fetchAdminOverview } from "@/hooks/admin/use-admin-overview";

export function AdminDashboardView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: fetchAdminOverview,
  });

  if (isLoading) return <p className="text-textSecondary">Loading dashboard…</p>;
  if (error) return <p className="text-danger">{(error as Error).message}</p>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <p className="mt-1 text-sm text-textSecondary">Platform statistics at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students" value={data.totalStudents} />
        <StatCard label="Total courses" value={data.totalCourses} />
        <StatCard label="Total modules" value={data.totalModules} />
        <StatCard label="Total lessons" value={data.totalLessons} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Enrollments" value={data.totalEnrollments} />
        <StatCard label="Completed lessons" value={data.completedLessons} />
      </div>
    </div>
  );
}
