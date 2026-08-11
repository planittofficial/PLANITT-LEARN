"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Layers, Plus, Trash2, ChevronRight, Upload } from "lucide-react";

import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  AdminSection,
} from "@/features/admin-ui";
import {
  defaultLessonId,
  inferLessonVideoFields,
  slugifyLessonId,
} from "@/lib/admin/lesson-video";
import {
  useAdminModules,
  useCreateModule,
  useDeleteModule,
} from "@/hooks/admin/use-admin-modules";
import { useAdminCourse, useUpdateCourse } from "@/hooks/admin/use-admin-courses";
import { usePresignUpload } from "@/hooks/admin/use-admin-lessons";

export function CourseDetailAdminView({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { data: course } = useAdminCourse(courseId);
  const updateCourse = useUpdateCourse(courseId);
  const { data: modules, isLoading } = useAdminModules(courseId);
  const createModule = useCreateModule(courseId);
  const deleteModule = useDeleteModule(courseId);
  const presign = usePresignUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [lectureTitle, setLectureTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [skipAutoLesson, setSkipAutoLesson] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setId("");
    setTitle("");
    setLectureTitle("");
    setVideoUrl("");
    setVideoFile(null);
    setSkipAutoLesson(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadVideoForLesson(lessonId: string, file: File) {
    const result = await presign.mutateAsync({
      filename: file.name,
      contentType: file.type || "video/mp4",
      lessonId,
    });

    if (result.uploadUrl) {
      await fetch(result.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "video/mp4" },
      });
      return { videoKey: result.videoKey, videoUrl: result.publicUrl || undefined };
    }

    return { videoKey: result.videoKey };
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const moduleId = slugifyLessonId(id.trim() || title.trim());
    const moduleTitle = title.trim();
    const lessonTitle = (lectureTitle.trim() || moduleTitle).trim();

    try {
      await createModule.mutateAsync({ id: moduleId, title: moduleTitle, published: true });

      if (!course?.published) {
        await updateCourse.mutateAsync({ published: true });
      }

      if (!skipAutoLesson) {
        const lessonId = defaultLessonId(moduleId);
        const videoFields = inferLessonVideoFields(videoUrl);
        const kind = videoFile ? "video" : videoFields.kind;

        const createRes = await fetch("/api/v1/admin/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: lessonId,
            moduleId,
            title: lessonTitle,
            kind,
            videoUrl: kind === "video" ? videoFields.videoUrl : undefined,
            externalUrl: kind === "external" ? videoFields.externalUrl : undefined,
          }),
        });

        if (!createRes.ok) {
          const detail = await createRes.json().catch(() => null);
          throw new Error(
            (detail as { detail?: string })?.detail ??
              "Module created, but the lecture could not be saved.",
          );
        }

        if (videoFile) {
          const uploaded = await uploadVideoForLesson(lessonId, videoFile);
          await fetch(`/api/v1/admin/lessons/${lessonId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              kind: "video",
              videoKey: uploaded.videoKey,
              videoUrl: uploaded.videoUrl,
            }),
          });
        }

        router.push(`/admin/modules/${moduleId}`);
      } else {
        router.push(`/admin/modules/${moduleId}`);
      }

      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create module.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <AdminPageHeader
        eyebrow="Course Module Editor"
        title={course?.title ?? courseId}
        description={course?.blurb ?? "Manage modules and lesson structure for this course."}
        icon={Layers}
        action={
          <Link href={`/admin/courses/${courseId}/edit`}>
            <AdminButton variant="secondary">Edit Course Settings</AdminButton>
          </Link>
        }
      />

      <AdminSection
        title="Module Index"
        description="Each module is one lecture by default. Add extra lessons later only if you need them."
        action={
          <AdminButton onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-3.5 w-3.5" />
            Add Module
          </AdminButton>
        }
      >
        {showForm ? (
          <AdminCard highlight className="mb-4">
            <p className="font-mono text-[9px] text-brand uppercase tracking-widest mb-3">
              // New Module Configuration
            </p>
            <form onSubmit={handleCreate} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminInput
                  label="Module ID"
                  placeholder="e.g. crypto-intro"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                />
                <AdminInput
                  label="Module Title"
                  placeholder="Introduction to Cryptocurrency"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {!skipAutoLesson ? (
                <>
                  <AdminInput
                    label="Lecture Title"
                    placeholder="Defaults to module title"
                    value={lectureTitle}
                    onChange={(e) => setLectureTitle(e.target.value)}
                  />

                  <div className="rounded-lg border border-white/10 bg-[#131313]/60 p-4 space-y-4">
                    <p className="font-mono text-[9px] text-textMuted uppercase tracking-widest">
                      Primary video (optional now — you can upload later)
                    </p>
                    <AdminInput
                      label="Video link"
                      placeholder="YouTube, Vimeo, or direct .mp4 URL"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <div>
                      <span className="font-mono text-[9px] text-textMuted uppercase tracking-widest">
                        Or upload video file
                      </span>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*"
                          className="block max-w-full text-xs text-textSecondary file:mr-3 file:rounded file:border-0 file:bg-brand/15 file:px-3 file:py-2 file:font-mono file:text-[10px] file:uppercase file:text-brand"
                          onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                        />
                        {videoFile ? (
                          <span className="font-mono text-[10px] text-brand">{videoFile.name}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              <label className="flex items-start gap-2 text-sm text-textSecondary">
                <input
                  type="checkbox"
                  className="mt-1 accent-brand"
                  checked={skipAutoLesson}
                  onChange={(e) => setSkipAutoLesson(e.target.checked)}
                />
                <span>
                  Skip auto-lecture — I&apos;ll add lessons manually later from the module page.
                </span>
              </label>

              {error ? (
                <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <AdminButton type="submit" disabled={submitting}>
                  <Upload className="h-3.5 w-3.5" />
                  {submitting ? "Creating…" : skipAutoLesson ? "Create Module" : "Create Module & Lecture"}
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </AdminButton>
              </div>
            </form>
          </AdminCard>
        ) : null}

        {isLoading ? (
          <p className="font-mono text-xs text-textMuted uppercase tracking-widest animate-pulse">
            Loading modules…
          </p>
        ) : null}

        <div className="space-y-3">
          {(modules ?? []).map((mod) => (
            <div
              key={mod.id}
              className="group flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/5 bg-[#131313]/60 px-5 py-4 hover:border-brand/30 transition"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/modules/${mod.id}`}
                  className="font-mono font-bold text-brand hover:underline uppercase tracking-wide flex items-center gap-1"
                >
                  {mod.title}
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition" />
                </Link>
                <p className="mt-1 font-mono text-[9px] text-textMuted uppercase tracking-widest">
                  {mod.id} · {mod.lessonCount} lesson{mod.lessonCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/modules/${mod.id}`}>
                  <AdminButton variant="secondary" size="sm">
                    Open Module
                  </AdminButton>
                </Link>
                <Link href={`/admin/quizzes/modules/${mod.id}`}>
                  <AdminButton variant="secondary" size="sm">
                    Module Test
                  </AdminButton>
                </Link>
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => deleteModule.mutate(mod.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </AdminButton>
              </div>
            </div>
          ))}
        </div>

        {(modules ?? []).length === 0 && !isLoading ? (
          <div className="rounded-lg border border-dashed border-white/10 px-6 py-10 text-center font-mono text-xs text-textMuted uppercase tracking-wider">
            No modules yet. Add your first module above.
          </div>
        ) : null}
      </AdminSection>
    </div>
  );
}
