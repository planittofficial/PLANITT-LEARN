"use client";

import { ExternalLink, Film, Link2, Loader2, Upload, Video } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { isYoutubeUrl, toYoutubeEmbedUrl } from "@/lib/video/video-url";
import { cn } from "@/lib/utils";

type VideoUploadPanelProps = {
  videoUrl: string;
  durationSeconds: number | "";
  uploading?: boolean;
  onVideoUrlChange: (url: string) => void;
  onDurationChange: (seconds: number | "") => void;
  onFileSelect: (file: File) => void | Promise<void>;
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoUploadPanel({
  videoUrl,
  durationSeconds,
  uploading,
  onVideoUrlChange,
  onDurationChange,
  onFileSelect,
}: VideoUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const youtubeEmbedUrl = toYoutubeEmbedUrl(videoUrl);
  const isYoutube = isYoutubeUrl(videoUrl);

  const readDurationFromFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        if (Number.isFinite(video.duration) && video.duration > 0) {
          onDurationChange(Math.round(video.duration));
        }
      };
      video.src = url;
    },
    [onDurationChange],
  );

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) return;
      readDurationFromFile(file);
      await onFileSelect(file);
    },
    [onFileSelect, readDurationFromFile],
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-surface to-base">
      <div className="border-b border-borderSubtle/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-textPrimary">Video content</h2>
            <p className="text-xs text-textSecondary">
              Upload MP4/WebM, or paste a YouTube or hosted video link.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) void handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all",
            dragOver
              ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
              : "border-borderSubtle hover:border-violet-500/40 hover:bg-overlay-faint",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
              <p className="mt-3 text-sm font-medium">Uploading video…</p>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10">
                <Upload className="h-7 w-7 text-violet-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-textPrimary">
                Drag & drop your video here
              </p>
              <p className="mt-1 text-xs text-textMuted">or click to browse · MP4, WebM, MOV</p>
            </>
          )}
        </div>

        {/* Preview + metadata */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-borderSubtle bg-black/60">
            {youtubeEmbedUrl ? (
              <iframe
                key={youtubeEmbedUrl}
                src={youtubeEmbedUrl}
                title="YouTube preview"
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoUrl ? (
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                className="aspect-video w-full"
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration;
                  if (Number.isFinite(d) && d > 0 && durationSeconds === "") {
                    onDurationChange(Math.round(d));
                  }
                }}
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 text-textMuted">
                <Film className="h-10 w-10 opacity-40" />
                <p className="text-xs">No video yet — upload or paste a link to preview</p>
              </div>
            )}
          </div>

          <label className="block text-sm">
            <span className="flex items-center gap-2 text-textSecondary">
              <Link2 className="h-4 w-4 shrink-0 text-violet-400" />
              YouTube or hosted video URL
            </span>
            <input
              className="mt-1 w-full rounded-lg border border-borderSubtle bg-background px-3 py-2 text-sm"
              value={videoUrl}
              onChange={(e) => onVideoUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=… or https://youtu.be/…"
            />
            <p className="mt-1.5 text-xs text-textMuted">
              Supports YouTube watch, share, and Shorts links, or any direct MP4/WebM URL.
            </p>
          </label>

          {isYoutube && videoUrl.trim() ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-textPrimary">YouTube link attached</p>
                <p className="truncate text-xs text-textMuted">{videoUrl.trim()}</p>
              </div>
              <a
                href={videoUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-red-500 hover:underline"
              >
                Open
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-textSecondary">Duration (seconds)</span>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border border-borderSubtle bg-background px-3 py-2 text-sm"
                value={durationSeconds}
                onChange={(e) =>
                  onDurationChange(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </label>
            <div className="flex flex-col justify-end">
              <p className="text-xs text-textMuted">Display duration</p>
              <p className="text-lg font-semibold text-violet-400">
                {typeof durationSeconds === "number" && durationSeconds > 0
                  ? formatDuration(durationSeconds)
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
