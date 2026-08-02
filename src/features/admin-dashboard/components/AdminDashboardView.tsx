"use client";

import Link from "next/link";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers,
  Users,
  TrendingUp,
  Zap,
  BarChart3,
  AlertTriangle,
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
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-6 font-mono text-xs text-rose-400 uppercase tracking-wider">
        &gt; ERROR: {(error as Error).message}
      </div>
    );
  }
  if (!data) return null;

  const completionRate =
    data.totalLessons > 0
      ? Math.round((data.completedLessons / data.totalLessons) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in">
      <AdminPageHeader
        eyebrow="Control Panel"
        title="Admin Dashboard"
        description="Platform metrics, content status, and learner activity all in one place."
        icon={Activity}
        action={
          <Link
            href={ROUTES.ADMIN.COURSES}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground hover:bg-brandHover transition shadow-card"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Manage Courses
          </Link>
        }
      />

      {/* System Status Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-borderSubtle bg-surface/80 backdrop-blur-md px-5 py-3 shadow-card">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse shadow-[0_0_8px_#14B8A6]" />
          <span className="text-brand font-bold">System operational</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
          All APIs Active
        </div>
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <TrendingUp className="h-3.5 w-3.5 text-brand" />
          Zero Incidents
        </div>
        <div className="ml-auto text-xs text-textMuted">
          Admin console
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total Students" value={data.totalStudents} icon={Users} accent="violet" />
        <AdminStatCard label="Total Courses" value={data.totalCourses} icon={GraduationCap} accent="indigo" />
        <AdminStatCard label="Total Modules" value={data.totalModules} icon={Layers} accent="sky" />
        <AdminStatCard label="Total Lessons" value={data.totalLessons} icon={BookOpen} accent="emerald" />
      </div>

      {/* Enrollment + Completion */}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminStatCard
          label="Active Enrollments"
          value={data.totalEnrollments}
          hint="Course access granted"
          icon={Users}
          accent="amber"
        />
        <AdminStatCard
          label="Lessons Completed"
          value={data.completedLessons}
          hint={`${completionRate}% platform completion`}
          icon={CheckCircle2}
          accent="rose"
        />
      </div>

      {/* Quick Navigation Bento */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: ROUTES.ADMIN.COURSES, label: "COURSE_MGMT", desc: "Manage content library", icon: BookOpen, color: "brand" },
          { href: ROUTES.ADMIN.STUDENTS, label: "STUDENT_ROSTER", desc: "View enrolled students", icon: Users, color: "accent" },
          { href: ROUTES.ADMIN.ANALYTICS, label: "ANALYTICS_SUITE", desc: "Platform insights", icon: BarChart3, color: "amber" },
          { href: ROUTES.ADMIN.LEADERBOARD, label: "LEADERBOARD", desc: "Student rankings", icon: Zap, color: "violet" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative rounded-xl border border-borderSubtle bg-surface/80 backdrop-blur-md p-5 shadow-card hover:border-brand/40 transition overflow-hidden"
          >
            <div className="glow-border" />
            <div className="relative z-10">
              <card.icon className="h-5 w-5 text-brand mb-3" />
              <p className="text-sm font-semibold text-textPrimary group-hover:text-brand transition">
                {card.label}
              </p>
              <p className="text-xs text-textMuted mt-1">
                {card.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

