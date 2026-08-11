"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Play, Plus, Trash2, Upload, Video, CheckCircle2, AlertTriangle } from "lucide-react";

import { AdminBreadcrumb } from "@/features/admin-lessons/components/AdminBreadcrumb";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  AdminSection,
} from "@/features/admin-ui";
import { defaultLessonId, inferLessonVideoFields } from "@/lib/admin/lesson-video";
import { useAdminModule, useUpdateModule } from "@/hooks/admin/use-admin-modules";
import {
  useAdminLessons,
  useCreateLesson,
  useDeleteLesson,
} from "@/hooks/admin/use-admin-lessons";

const KIND_ICONS = { video: Video, article: FileText, external: Play } as const;

export function ModuleDetailAdminView({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const { data: moduleRow } = useAdminModule(moduleId);
  const { data: lessons, isLoading } = useAdminLessons(moduleId);
  const createLesson = useCreateLesson(moduleId);
  const deleteLesson = useDeleteLesson(moduleId);
  const courseId = moduleRow?.courseId ?? lessons?.[0]?.courseId;
  const updateModule = useUpdateModule(moduleId, courseId ?? "");

  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [kind, setKind] = useState<"video" | "article" | "external">("video");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showForm || !courseId) return;
    setId(defaultLessonId(moduleId, lessons?.length ?? 0, courseId));
  }, [showForm, moduleId, lessons?.length, courseId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const lessonId =
      id.trim() || defaultLessonId(moduleId, lessons?.length ?? 0, courseId);
    const lessonTitle = title.trim();
    if (!lessonTitle) {
      setError("Lesson title is required.");
      return;
    }

    const inferred = inferLessonVideoFields(videoUrl);
    const resolvedKind = videoUrl.trim() ? inferred.kind : kind;
    const payload: Record<string, unknown> = {
      id: lessonId,
      title: lessonTitle,
      kind: resolvedKind,
    };

    if (resolvedKind === "video" && inferred.videoUrl) payload.videoUrl = inferred.videoUrl;
    if (resolvedKind === "external" && inferred.externalUrl) payload.externalUrl = inferred.externalUrl;

    try {
      await createLesson.mutateAsync(payload);
      setShowForm(false);
      setTitle("");
      setVideoUrl("");
      router.push(`/admin/lessons/${lessonId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lesson.");
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
          { label: moduleRow?.title ?? "Module" },
        ]}
      />

      <AdminPageHeader
        eyebrow="Lesson Registry"
        title={moduleRow?.title ?? "Module Lesson Editor"}
        description={
          (lessons?.length ?? 0) > 0
            ? "Your primary lecture is ready. Add more lessons only if this module needs them."
            : "This module has no lecture yet. Add one below, or go back and create the module with a video from the course page."
        }
        icon={Video}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {moduleRow ? (
              <span
                className={`rounded px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest border ${
                  moduleRow.published
                    ? "border-brand/20 bg-brand/5 text-brand"
                    : "border-amber-500/20 bg-amber-500/5 text-amber-400"
                }`}
              >
                {moduleRow.published ? "Live for students" : "Draft — hidden"}
              </span>
            ) : null}
            {!moduleRow?.published ? (
              <AdminButton
                variant="secondary"
                onClick={() => updateModule.mutate({ published: true })}
                disabled={updateModule.isPending}
              >
                Publish module
              </AdminButton>
            ) : null}
            <AdminButton onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-3.5 w-3.5" />
              Add Lesson
            </AdminButton>
          </div>
        }
      />

      {showForm ? (
        <AdminCard highlight className="mb-4">
          <p className="font-mono text-[9px] text-brand uppercase tracking-widest mb-3">
            // Additional Lesson (optional)
          </p>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Lesson ID"
              placeholder="auto-generated"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
            <AdminInput
              label="Lesson Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <AdminInput
              label="Video / external link (optional)"
              placeholder="YouTube, Vimeo, or hosted video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="sm:col-span-2"
            />
            <label className="block sm:col-span-2">
              <span className="font-mono text-[9px] text-textMuted uppercase tracking-widest">
                Lesson Type (when no link is provided)
              </span>
              <select
                className="mt-1.5 w-full rounded border border-white/5 bg-[#1C1B1B] px-3 py-2.5 font-mono text-xs text-textPrimary outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 uppercase tracking-wide"
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="video">Video (upload on next screen)</option>
                <option value="article">Article</option>
                <option value="external">External link</option>
              </select>
            </label>

            {error ? (
              <p
                role="alert"
                className="sm:col-span-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
              >
                {error}
              </p>
            ) : null}

            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <AdminButton type="submit" disabled={createLesson.isPending}>
                {createLesson.isPending ? "Creating…" : "Create & Continue"}
              </AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      ) : null}

      <AdminSection title="Lesson Index">
        {isLoading ? (
          <p className="font-mono text-xs text-textMuted uppercase tracking-widest animate-pulse">
            Loading lesson nodes…
          </p>
        ) : null}

        <div className="space-y-3">
          {(lessons ?? []).map((lesson) => {
            const Icon = KIND_ICONS[lesson.kind] ?? FileText;
            const hasVideo = Boolean(lesson.videoUrl || lesson.externalUrl);

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
                      {lesson.kind === "video" || lesson.kind === "external" ? (
                        <span className={hasVideo ? " text-brand" : " text-amber-400"}>
                          {" "}
                          · {hasVideo ? "VIDEO_ATTACHED" : "NO_VIDEO"}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lesson.kind === "video" || lesson.kind === "external" ? (
                    hasVideo ? (
                      <div className="flex items-center gap-1 font-mono text-[9px] text-brand border border-brand/20 bg-brand/5 px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        Ready
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 font-mono text-[9px] text-amber-400 border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                        <AlertTriangle className="h-3 w-3" />
                        Missing
                      </div>
                    )
                  ) : null}

                  <Link href={`/admin/lessons/${lesson.id}`}>
                    <AdminButton variant="secondary" size="sm">
                      <Upload className="h-3 w-3" />
                      {lesson.kind === "video" ? "Edit / Upload" : "Edit"}
                    </AdminButton>
                  </Link>

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
          <div className="rounded-lg border border-dashed border-white/10 px-6 py-10 text-center space-y-3">
            <p className="font-mono text-xs text-textMuted uppercase tracking-wider">
              No lessons in this module yet.
            </p>
            <AdminButton onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add first lesson
            </AdminButton>
          </div>
        ) : null}
      </AdminSection>
    </div>
  );
}
