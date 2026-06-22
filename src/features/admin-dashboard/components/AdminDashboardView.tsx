"use client";

import Link from "next/link";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  AdminPageHeader,
  AdminPageSkeleton,
  AdminStatCard,
} from "@/features/admin-ui";
import { fetchAdminOverview } from "@/hooks/admin/use-admin-overview";
import { ROUTES } from "@/constants/routes";

export function AdminDashboardView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: fetchAdminOverview,
  });

  if (isLoading) return <AdminPageSkeleton />;
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-400">
        {(error as Error).message}
      </div>
    );
  }
  if (!data) return null;

  const completionRate =
    data.totalLessons > 0
      ? Math.round((data.completedLessons / data.totalLessons) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Overview"
        title="Admin dashboard"
        description="Platform health, content inventory, and learner activity at a glance."
        icon={Activity}
        action={
          <Link
            href={ROUTES.ADMIN.COURSES}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:brightness-110"
          >
            Manage courses
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total students" value={data.totalStudents} icon={Users} accent="violet" />
        <AdminStatCard label="Total courses" value={data.totalCourses} icon={GraduationCap} accent="indigo" />
        <AdminStatCard label="Total modules" value={data.totalModules} icon={Layers} accent="sky" />
        <AdminStatCard label="Total lessons" value={data.totalLessons} icon={BookOpen} accent="emerald" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminStatCard
          label="Enrollments"
          value={data.totalEnrollments}
          hint="Active course enrollments"
          icon={Users}
          accent="amber"
        />
        <AdminStatCard
          label="Completed lessons"
          value={data.completedLessons}
          hint={`${completionRate}% of all lesson slots`}
          icon={CheckCircle2}
          accent="rose"
        />
      </div>
    </div>
  );
}
