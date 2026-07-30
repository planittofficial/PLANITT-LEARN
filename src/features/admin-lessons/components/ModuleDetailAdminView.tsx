"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Play, Plus, Trash2, Upload, Video, CheckCircle2, AlertTriangle } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in">
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
        eyebrow="Lesson Registry"
        title="Module Lesson Editor"
        description="Click a lesson to edit content. Video lessons open the upload and metadata screen."
        icon={Video}
        action={
          <AdminButton onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-3.5 w-3.5" />
            Add Lesson
          </AdminButton>
        }
      />

      {showForm ? (
        <AdminCard highlight className="mb-4">
          <p className="font-mono text-[9px] text-brand uppercase tracking-widest mb-3">// New Lesson Configuration</p>
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
                label="Lesson Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <label className="block">
              <span className="font-mono text-[9px] text-textMuted uppercase tracking-widest">Lesson Type</span>
              <select
                className="mt-1.5 w-full rounded border border-white/5 bg-[#1C1B1B] px-3 py-2.5 font-mono text-xs text-textPrimary outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 uppercase tracking-wide"
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
                Create & {kind === "video" ? "Open Upload Screen" : "Continue"}
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      ) : null}

      <AdminSection title="Lesson Index">
        {isLoading ? (
          <p className="font-mono text-xs text-textMuted uppercase tracking-widest animate-pulse">Loading lesson nodes…</p>
        ) : null}

        <div className="space-y-3">
          {(lessons ?? []).map((lesson) => {
            const Icon = KIND_ICONS[lesson.kind] ?? FileText;
            const hasVideo = Boolean(lesson.videoUrl);

            return (
              <div
                key={lesson.id}
                className="group flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/5 bg-[#131313]/60 px-5 py-4 hover:border-brand/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded border font-bold ${
                      lesson.kind === "video"
                        ? "border-brand/20 bg-brand/10 text-brand"
                        : "border-white/5 bg-[#1C1B1B] text-textMuted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/lessons/${lesson.id}`}
                      className="font-mono font-bold text-brand hover:underline uppercase tracking-wide"
                    >
                      {lesson.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-[9px] text-textMuted uppercase tracking-widest">
                      {lesson.id} · {lesson.kind}
                      {lesson.kind === "video" ? (
                        <span className={hasVideo ? " text-brand" : " text-amber-400"}>
                          {" "}· {hasVideo ? "VIDEO_ATTACHED" : "NO_VIDEO"}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Video badge */}
                  {lesson.kind === "video" ? (
                    hasVideo ? (
                      <div className="flex items-center gap-1 font-mono text-[9px] text-brand border border-brand/20 bg-brand/5 px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        Uploaded
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 font-mono text-[9px] text-amber-400 border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                        <AlertTriangle className="h-3 w-3" />
                        Missing
                      </div>
                    )
                  ) : (
                    <div className="font-mono text-[9px] text-textMuted border border-white/5 bg-[#1C1B1B] px-2 py-0.5 rounded uppercase tracking-widest">
                      {lesson.kind}
                    </div>
                  )}

                  {lesson.kind === "video" ? (
                    <Link href={`/admin/lessons/${lesson.id}`}>
                      <AdminButton variant="secondary" size="sm">
                        <Upload className="h-3 w-3" />
                        Upload Video
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

                  <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={() => deleteLesson.mutate(lesson.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </AdminButton>
                </div>
              </div>
            );
          })}
        </div>

        {(lessons ?? []).length === 0 && !isLoading ? (
          <div className="rounded-lg border border-dashed border-white/10 px-6 py-10 text-center font-mono text-xs text-textMuted uppercase tracking-wider">
            No lessons yet. Add your first lesson above.
          </div>
        ) : null}
      </AdminSection>
    </div>
  );
}
