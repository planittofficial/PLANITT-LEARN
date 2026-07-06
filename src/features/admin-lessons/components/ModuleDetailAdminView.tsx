"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Play, Plus, Trash2, Upload, Video } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { AdminBreadcrumb } from "@/features/admin-lessons/components/AdminBreadcrumb";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  AdminSection,
} from "@/features/admin-ui";
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
    <div className="space-y-8">
      <AdminBreadcrumb
        items={[
          { label: "Courses", href: "/admin/courses" },
          ...(courseId
            ? [{ label: courseId, href: `/admin/courses/${courseId}` }]
            : []),
          { label: "Lessons" },
        ]}
      />

      <AdminPageHeader
        eyebrow="Module"
        title="Module lessons"
        description="Click a lesson to edit content. Video lessons open the upload screen."
        icon={Video}
        action={
          <AdminButton onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            Add lesson
          </AdminButton>
        }
      />

      {showForm ? (
        <AdminCard highlight>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-4">
            <AdminInput
              label="Lesson ID"
              placeholder="fx-m1-l3"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
            <div className="sm:col-span-2">
              <AdminInput
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <label className="block text-sm">
              <span className="text-textSecondary">Type</span>
              <select
                className="mt-1.5 w-full rounded-xl border border-borderSubtle bg-overlay-subtle px-3 py-2.5 text-sm outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="external">External</option>
              </select>
            </label>
            <div className="sm:col-span-4">
              <AdminButton type="submit">
                Create & {kind === "video" ? "open upload screen" : "continue"}
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      ) : null}

      <AdminSection title="Lessons">
        {isLoading ? <p className="text-textSecondary">Loading…</p> : null}

        <div className="space-y-3">
          {(lessons ?? []).map((lesson) => {
            const Icon = KIND_ICONS[lesson.kind] ?? FileText;
            const hasVideo = Boolean(lesson.videoUrl);

            return (
              <AdminCard
                key={lesson.id}
                className="flex flex-wrap items-center justify-between gap-4 !p-4 transition hover:border-violet-500/20"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      lesson.kind === "video"
                        ? "bg-violet-500/15 text-violet-400"
                        : "bg-overlay-hover text-textMuted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <Link
                      href={`/admin/lessons/${lesson.id}`}
                      className="font-semibold text-violet-400 hover:underline"
                    >
                      {lesson.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-textMuted">
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
                <div className="flex flex-wrap gap-2">
                  {lesson.kind === "video" ? (
                    <Link href={`/admin/lessons/${lesson.id}`}>
                      <AdminButton variant="secondary" size="sm">
                        <Upload className="h-3.5 w-3.5" />
                        Upload video
                      </AdminButton>
                    </Link>
                  ) : (
                    <Link href={`/admin/lessons/${lesson.id}`}>
                      <AdminButton variant="secondary" size="sm">
                        Edit
                      </AdminButton>
                    </Link>
                  )}
                  <Link href={`/admin/quizzes/lessons/${lesson.id}`}>
                    <AdminButton variant="ghost" size="sm">
                      Quiz
                    </AdminButton>
                  </Link>
                  <Badge variant={hasVideo || lesson.kind !== "video" ? "success" : "warning"}>
                    {lesson.kind}
                  </Badge>
                  <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={() => deleteLesson.mutate(lesson.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </AdminButton>
                </div>
              </AdminCard>
            );
          })}
        </div>
      </AdminSection>
    </div>
  );
}
