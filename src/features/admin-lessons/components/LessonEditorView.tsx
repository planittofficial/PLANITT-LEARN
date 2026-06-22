"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Link2, Save, Video } from "lucide-react";

import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  AdminPageSkeleton,
  AdminTextarea,
} from "@/features/admin-ui";
import { AdminBreadcrumb } from "@/features/admin-lessons/components/AdminBreadcrumb";
import { VideoUploadPanel } from "@/features/admin-lessons/components/VideoUploadPanel";
import {
  useAdminLesson,
  usePresignUpload,
  useUpdateLesson,
} from "@/hooks/admin/use-admin-lessons";
import type { LessonKind } from "@/types/course.types";
import { cn } from "@/lib/utils";

const LESSON_TYPES: Array<{
  kind: LessonKind;
  label: string;
  description: string;
  icon: typeof Video;
}> = [
  {
    kind: "video",
    label: "Video",
    description: "Upload or link a video lecture",
    icon: Video,
  },
  {
    kind: "article",
    label: "Article",
    description: "Written markdown content",
    icon: FileText,
  },
  {
    kind: "external",
    label: "External",
    description: "Link to an outside resource",
    icon: Link2,
  },
];

export function LessonEditorView({ lessonId }: { lessonId: string }) {
  const { data: lesson, isLoading } = useAdminLesson(lessonId);
  const updateLesson = useUpdateLesson(lessonId, lesson?.moduleId ?? "");
  const presign = usePresignUpload();

  const [kind, setKind] = useState<LessonKind>("article");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number | "">("");
  const [markdown, setMarkdown] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    setKind(lesson.kind);
    setTitle(lesson.title);
    setSummary(lesson.summary);
    setVideoUrl(lesson.videoUrl ?? "");
    setExternalUrl(lesson.externalUrl ?? "");
    setDurationSeconds(lesson.durationSeconds ?? "");
    setMarkdown(lesson.markdown ?? "");
  }, [lesson]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateLesson.mutateAsync({
      kind,
      title,
      summary,
      videoUrl: kind === "video" ? videoUrl || undefined : undefined,
      externalUrl: kind === "external" ? externalUrl || undefined : undefined,
      durationSeconds:
        kind === "video" && durationSeconds !== "" ? Number(durationSeconds) : undefined,
      markdown: kind === "article" ? markdown || undefined : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handlePresign(file: File) {
    setUploading(true);
    try {
      const result = await presign.mutateAsync({
        filename: file.name,
        contentType: file.type || "video/mp4",
        lessonId,
      });
      if (result.uploadUrl) {
        await fetch(result.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        setVideoUrl(result.publicUrl);
        await updateLesson.mutateAsync({
          videoKey: result.videoKey,
          videoUrl: result.publicUrl || undefined,
          kind: "video",
        });
        setKind("video");
      } else {
        await updateLesson.mutateAsync({ videoKey: result.videoKey, kind: "video" });
        setKind("video");
        alert("R2 not configured — paste your hosted video URL below.");
      }
    } finally {
      setUploading(false);
    }
  }

  if (isLoading) return <AdminPageSkeleton />;
  if (!lesson) return <p>Lesson not found.</p>;

  return (
    <div className="space-y-8">
      <AdminBreadcrumb
        items={[
          { label: "Courses", href: "/admin/courses" },
          { label: lesson.courseId, href: `/admin/courses/${lesson.courseId}` },
          { label: "Module", href: `/admin/modules/${lesson.moduleId}` },
          { label: lesson.title },
        ]}
      />

      <AdminPageHeader
        eyebrow="Lesson editor"
        title="Edit lesson"
        description='Choose Video below to open the upload screen and attach lecture content.'
        icon={Video}
      />

      <AdminCard>
        <p className="mb-3 text-sm font-medium text-textPrimary">Lesson type</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {LESSON_TYPES.map((type) => {
            const Icon = type.icon;
            const selected = kind === type.kind;
            return (
              <button
                key={type.kind}
                type="button"
                onClick={() => setKind(type.kind)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition",
                  selected
                    ? "border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30"
                    : "border-borderSubtle hover:border-violet-500/30 hover:bg-white/[0.02]",
                )}
              >
                <Icon className={cn("h-5 w-5", selected ? "text-violet-400" : "text-textMuted")} />
                <span className="font-medium text-textPrimary">{type.label}</span>
                <span className="text-xs text-textMuted">{type.description}</span>
              </button>
            );
          })}
        </div>
      </AdminCard>

      {kind === "video" ? (
        <VideoUploadPanel
          videoUrl={videoUrl}
          durationSeconds={durationSeconds}
          uploading={uploading || presign.isPending}
          onVideoUrlChange={setVideoUrl}
          onDurationChange={setDurationSeconds}
          onFileSelect={handlePresign}
        />
      ) : null}

      <AdminCard>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <AdminTextarea
            label="Summary"
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          {kind === "article" ? (
            <AdminTextarea
              label="Markdown content"
              rows={12}
              className="font-mono text-xs"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          ) : null}

          {kind === "external" ? (
            <AdminInput
              label="External URL"
              placeholder="https://…"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          ) : null}

          <AdminButton type="submit" disabled={updateLesson.isPending}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {updateLesson.isPending ? "Saving…" : "Save lesson"}
              </>
            )}
          </AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}
