"use client";

import Link from "next/link";
import { useState } from "react";

import {
  useAdminLessons,
  useCreateLesson,
  useDeleteLesson,
} from "@/hooks/admin/use-admin-lessons";

export function ModuleDetailAdminView({ moduleId }: { moduleId: string }) {
  const { data: lessons, isLoading } = useAdminLessons(moduleId);
  const createLesson = useCreateLesson(moduleId);
  const deleteLesson = useDeleteLesson(moduleId);
  const courseId = lessons?.[0]?.courseId;
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"video" | "article" | "external">("video");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createLesson.mutateAsync({ id, title, kind });
    setShowForm(false);
    setId("");
    setTitle("");
  }

  return (
    <div className="space-y-6">
      {courseId ? (
        <Link href={`/admin/courses/${courseId}`} className="text-sm text-brand">← Back to course</Link>
      ) : null}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Module lessons</h1>
        <button type="button" className="rounded-lg bg-brand px-3 py-2 text-sm text-white" onClick={() => setShowForm((v) => !v)}>
          Add lesson
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="grid gap-3 rounded-xl border border-borderSubtle p-4 sm:grid-cols-4">
          <input className="rounded-lg border border-borderSubtle bg-surface px-3 py-2" placeholder="Lesson id" value={id} onChange={(e) => setId(e.target.value)} required />
          <input className="rounded-lg border border-borderSubtle bg-surface px-3 py-2 sm:col-span-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <select className="rounded-lg border border-borderSubtle bg-surface px-3 py-2" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="external">External</option>
          </select>
          <button type="submit" className="rounded-lg bg-brand px-3 py-2 text-sm text-white sm:col-span-4">Create lesson</button>
        </form>
      ) : null}

      {isLoading ? <p>Loading…</p> : null}
      <div className="space-y-2">
        {(lessons ?? []).map((lesson) => (
          <div key={lesson.id} className="flex items-center justify-between rounded-xl border border-borderSubtle p-4">
            <div>
              <Link href={`/admin/lessons/${lesson.id}`} className="font-medium text-brand">{lesson.title}</Link>
              <p className="text-xs text-textMuted">{lesson.id} · {lesson.kind}</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/admin/quizzes/lessons/${lesson.id}`} className="text-sm text-textSecondary">Quiz</Link>
              <button type="button" className="text-sm text-danger" onClick={() => deleteLesson.mutate(lesson.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
