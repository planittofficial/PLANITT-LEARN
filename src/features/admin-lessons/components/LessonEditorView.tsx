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
    description: "Upload, YouTube link, or hosted video",
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
  if (!lesson) return <p className="font-mono text-xs text-textMuted uppercase tracking-wider">LESSON_NOT_FOUND</p>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <AdminBreadcrumb
        items={[
          { label: "Courses", href: "/admin/courses" },
          { label: lesson.courseId, href: `/admin/courses/${lesson.courseId}` },
          { label: "Module", href: `/admin/modules/${lesson.moduleId}` },
          { label: lesson.title },
        ]}
      />

      <AdminPageHeader
        eyebrow="Lesson Settings"
        title="Lesson Editor"
        description="Choose Video below to open the upload screen and attach lecture content or update article contents."
        icon={Video}
      />

      <AdminCard>
        <p className="font-mono text-[9px] text-textMuted uppercase tracking-widest mb-3">Lesson_Type_Selector</p>
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
                  "flex flex-col items-start gap-2 rounded border p-4 text-left transition font-mono",
                  selected
                    ? "border-brand bg-brand/10 ring-1 ring-brand/30"
                    : "border-white/5 bg-[#131313]/60 hover:border-brand/40 hover:bg-[#1C1B1B]",
                )}
              >
                <Icon className={cn("h-4 w-4", selected ? "text-brand animate-pulse" : "text-textMuted")} />
                <span className="font-bold text-textPrimary text-xs uppercase tracking-wide">{type.label}</span>
                <span className="text-[9px] text-textMuted uppercase tracking-widest">{type.description}</span>
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
        <p className="font-mono text-[9px] text-textMuted uppercase tracking-widest mb-3">Lesson_Metadata_Properties</p>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminInput label="Lesson Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <AdminTextarea
            label="Lesson Summary"
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          {kind === "article" ? (
            <AdminTextarea
              label="Markdown Content Stream"
              rows={12}
              className="font-mono text-xs"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          ) : null}

          {kind === "external" ? (
            <AdminInput
              label="External Asset URL"
              placeholder="https://…"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          ) : null}

          <AdminButton type="submit" disabled={updateLesson.isPending}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-black" />
                Lesson_Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {updateLesson.isPending ? "Commiting_Changes…" : "Commit Lesson Metadata"}
              </>
            )}
          </AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}
