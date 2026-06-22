"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Play, Upload, Video } from "lucide-react";

import { AdminBreadcrumb } from "@/features/admin-lessons/components/AdminBreadcrumb";
import {
  useAdminLessons,
  useCreateLesson,
  useDeleteLesson,
} from "@/hooks/admin/use-admin-lessons";

const KIND_ICONS = { video: Video, article: FileText, external: Play } as const;

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
    const created = id;
    if (kind === "video") {
      window.location.href = `/admin/lessons/${created}`;
    }
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: "Courses", href: "/admin/courses" },
          ...(courseId
            ? [{ label: courseId, href: `/admin/courses/${courseId}` }]
            : []),
          { label: "Lessons" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Module lessons</h1>
          <p className="mt-1 text-sm text-textSecondary">
            Click a lesson to edit content. Video lessons open the upload screen.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black"
          onClick={() => setShowForm((v) => !v)}
        >
          <Upload className="h-4 w-4" />
          Add lesson
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 sm:grid-cols-4"
        >
          <input
            className="rounded-lg border border-borderSubtle bg-surface px-3 py-2 text-sm"
            placeholder="Lesson id (e.g. fx-m1-l3)"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-borderSubtle bg-surface px-3 py-2 text-sm sm:col-span-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            className="rounded-lg border border-borderSubtle bg-surface px-3 py-2 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
          >
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="external">External</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-black sm:col-span-4"
          >
            Create & {kind === "video" ? "open upload screen" : "continue"}
          </button>
        </form>
      ) : null}

      {isLoading ? <p className="text-textSecondary">Loading…</p> : null}

      <div className="space-y-2">
        {(lessons ?? []).map((lesson) => {
          const Icon = KIND_ICONS[lesson.kind] ?? FileText;
          const hasVideo = Boolean(lesson.videoUrl);

          return (
            <div
              key={lesson.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-borderSubtle p-4 transition hover:border-brand/30"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    lesson.kind === "video" ? "bg-brand/15 text-brand" : "bg-white/5 text-textMuted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <Link
                    href={`/admin/lessons/${lesson.id}`}
                    className="font-medium text-brand hover:underline"
                  >
                    {lesson.title}
                  </Link>
                  <p className="text-xs text-textMuted">
                    {lesson.id} · {lesson.kind}
                    {lesson.kind === "video" ? (
                      <span className={hasVideo ? " text-emerald-400" : " text-amber-400"}>
                        {" "}
                        · {hasVideo ? "Video attached" : "No video yet"}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {lesson.kind === "video" ? (
                  <Link
                    href={`/admin/lessons/${lesson.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload video
                  </Link>
                ) : (
                  <Link
                    href={`/admin/lessons/${lesson.id}`}
                    className="text-sm text-textSecondary hover:text-brand"
                  >
                    Edit
                  </Link>
                )}
                <Link
                  href={`/admin/quizzes/lessons/${lesson.id}`}
                  className="text-sm text-textSecondary hover:text-brand"
                >
                  Quiz
                </Link>
                <button
                  type="button"
                  className="text-sm text-danger"
                  onClick={() => deleteLesson.mutate(lesson.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
