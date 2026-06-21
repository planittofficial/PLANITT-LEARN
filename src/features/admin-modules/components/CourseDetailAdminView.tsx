"use client";

import Link from "next/link";
import { useState } from "react";

import {
  useAdminModules,
  useCreateModule,
  useDeleteModule,
} from "@/hooks/admin/use-admin-modules";
import { useAdminCourse } from "@/hooks/admin/use-admin-courses";

export function CourseDetailAdminView({ courseId }: { courseId: string }) {
  const { data: course } = useAdminCourse(courseId);
  const { data: modules, isLoading } = useAdminModules(courseId);
  const createModule = useCreateModule(courseId);
  const deleteModule = useDeleteModule(courseId);
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createModule.mutateAsync({ id, title });
    setShowForm(false);
    setId("");
    setTitle("");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/courses" className="text-sm text-brand">← Courses</Link>
        <h1 className="mt-2 text-2xl font-bold">{course?.title ?? courseId}</h1>
        <p className="text-sm text-textSecondary">{course?.blurb}</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Modules</h2>
        <button
          type="button"
          className="rounded-lg bg-brand px-3 py-2 text-sm text-white"
          onClick={() => setShowForm((v) => !v)}
        >
          Add module
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="grid gap-3 rounded-xl border border-borderSubtle p-4 sm:grid-cols-3">
          <input className="rounded-lg border border-borderSubtle bg-surface px-3 py-2" placeholder="Module id" value={id} onChange={(e) => setId(e.target.value)} required />
          <input className="rounded-lg border border-borderSubtle bg-surface px-3 py-2 sm:col-span-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <button type="submit" className="rounded-lg bg-brand px-3 py-2 text-sm text-white sm:col-span-3">Create module</button>
        </form>
      ) : null}

      {isLoading ? <p>Loading…</p> : null}
      <div className="space-y-2">
        {(modules ?? []).map((mod) => (
          <div key={mod.id} className="flex items-center justify-between rounded-xl border border-borderSubtle p-4">
            <div>
              <Link href={`/admin/modules/${mod.id}`} className="font-medium text-brand">{mod.title}</Link>
              <p className="text-xs text-textMuted">{mod.id} · {mod.lessonCount} lessons</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/admin/quizzes/modules/${mod.id}`} className="text-sm text-textSecondary">Module test</Link>
              <button type="button" className="text-sm text-danger" onClick={() => deleteModule.mutate(mod.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
