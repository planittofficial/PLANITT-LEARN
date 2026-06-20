"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  useAdminLesson,
  usePresignUpload,
  useUpdateLesson,
} from "@/hooks/admin/use-admin-lessons";

export function LessonEditorView({ lessonId }: { lessonId: string }) {
  const { data: lesson, isLoading } = useAdminLesson(lessonId);
  const updateLesson = useUpdateLesson(lessonId, lesson?.moduleId ?? "");
  const presign = usePresignUpload();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<number | "">("");
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (!lesson) return;
    setTitle(lesson.title);
    setSummary(lesson.summary);
    setVideoUrl(lesson.videoUrl ?? "");
    setDurationSeconds(lesson.durationSeconds ?? "");
    setMarkdown(lesson.markdown ?? "");
  }, [lesson]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateLesson.mutateAsync({
      title,
      summary,
      videoUrl: videoUrl || undefined,
      durationSeconds: durationSeconds === "" ? undefined : Number(durationSeconds),
      markdown: markdown || undefined,
    });
  }

  async function handlePresign(file: File) {
    const result = await presign.mutateAsync({
      filename: file.name,
      contentType: file.type || "video/mp4",
      lessonId,
    });
    if (result.uploadUrl) {
      await fetch(result.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setVideoUrl(result.publicUrl);
      await updateLesson.mutateAsync({ videoKey: result.videoKey, videoUrl: result.publicUrl || undefined });
    } else {
      await updateLesson.mutateAsync({ videoKey: result.videoKey });
      alert("R2 not configured — set video URL manually after upload.");
    }
  }

  if (isLoading) return <p>Loading lesson…</p>;
  if (!lesson) return <p>Lesson not found.</p>;

  return (
    <div className="space-y-6">
      <Link href={`/admin/modules/${lesson.moduleId}`} className="text-sm text-brand">← Back to module</Link>
      <h1 className="text-2xl font-bold">Edit lesson</h1>

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-borderSubtle p-5">
        <label className="block text-sm">
          <span className="text-textSecondary">Title</span>
          <input className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-textSecondary">Summary</span>
          <textarea className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </label>

        {lesson.kind === "video" ? (
          <div className="space-y-3 rounded-lg border border-borderSubtle/80 p-4">
            <p className="font-medium">Video upload</p>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePresign(file);
              }}
            />
            {videoUrl ? (
              <video src={videoUrl} controls className="max-h-48 w-full rounded-lg bg-black" />
            ) : null}
            <label className="block text-sm">
              <span className="text-textSecondary">Video URL</span>
              <input className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="text-textSecondary">Duration (seconds)</span>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </label>
          </div>
        ) : null}

        {lesson.kind === "article" ? (
          <label className="block text-sm">
            <span className="text-textSecondary">Markdown content</span>
            <textarea className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2 font-mono text-xs" rows={10} value={markdown} onChange={(e) => setMarkdown(e.target.value)} />
          </label>
        ) : null}

        <button type="submit" disabled={updateLesson.isPending} className="rounded-lg bg-brand px-4 py-2 text-sm text-white">
          {updateLesson.isPending ? "Saving…" : "Save lesson"}
        </button>
      </form>
    </div>
  );
}
