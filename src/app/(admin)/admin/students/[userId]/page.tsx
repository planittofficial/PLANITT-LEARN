"use client";

import Link from "next/link";
import { use } from "react";

import { useAdminStudent } from "@/hooks/admin/use-admin-students";

export default function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { data: student, isLoading, error } = useAdminStudent(userId);

  if (isLoading) return <p>Loading student…</p>;
  if (error) return <p className="text-danger">{(error as Error).message}</p>;
  if (!student) return <p>Student not found.</p>;

  const progressPercent =
    student.progress.length > 0
      ? Math.round(
          (student.progress.filter((p) => p.completed).length / student.progress.length) * 100,
        )
      : 0;

  return (
    <div className="space-y-8">
      <Link href="/admin/students" className="text-sm text-brand">← Students</Link>
      <div>
        <h1 className="text-2xl font-bold">{student.name ?? student.id}</h1>
        <p className="text-sm text-textSecondary">{student.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-borderSubtle p-4"><p className="text-sm text-textSecondary">Enrolled courses</p><p className="text-2xl font-bold">{student.enrolledCourseCount}</p></div>
        <div className="rounded-xl border border-borderSubtle p-4"><p className="text-sm text-textSecondary">Lessons completed</p><p className="text-2xl font-bold">{student.lessonsCompleted}</p></div>
        <div className="rounded-xl border border-borderSubtle p-4"><p className="text-sm text-textSecondary">Progress</p><p className="text-2xl font-bold">{progressPercent}%</p></div>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Enrollments</h2>
        <div className="mt-2 space-y-2">
          {student.enrollments.map((e) => (
            <div key={e.courseId} className="rounded-lg border border-borderSubtle px-4 py-3 text-sm">
              {e.courseTitle} · {new Date(e.enrolledAt).toLocaleDateString()}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Lesson progress</h2>
        <div className="mt-2 space-y-2">
          {student.progress.map((p) => (
            <div key={p.lessonId} className="flex justify-between rounded-lg border border-borderSubtle px-4 py-3 text-sm">
              <span>{p.lessonTitle}</span>
              <span className="text-textSecondary">{p.watchPercent}% {p.completed ? "✓" : ""}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Quiz scores</h2>
        <div className="mt-2 space-y-2">
          {student.quizResults.map((q) => (
            <div key={q.id} className="flex justify-between rounded-lg border border-borderSubtle px-4 py-3 text-sm">
              <span>{q.type} quiz</span>
              <span className={q.passed ? "text-success" : "text-danger"}>{q.score}/{q.maxScore}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
