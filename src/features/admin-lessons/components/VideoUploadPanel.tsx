"use client";

import { Film, Link2, Loader2, Upload, Video } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { buildSecureYoutubeEmbedUrl, getYoutubeVideoId } from "@/lib/video/youtube-embed";
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
  const youtubeVideoId = getYoutubeVideoId(videoUrl);
  const youtubeEmbedUrl = youtubeVideoId ? buildSecureYoutubeEmbedUrl(youtubeVideoId) : null;
  const isYoutube = Boolean(youtubeVideoId);

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
    <section className="overflow-hidden rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-brand/20 bg-brand/10 text-brand">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold text-textPrimary uppercase tracking-wider">Video Asset Stream</h2>
            <p className="font-mono text-[9px] text-textMuted uppercase tracking-widest mt-0.5">
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
            "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded border border-dashed p-8 text-center transition-all",
            dragOver
              ? "border-brand bg-brand/10 scale-[1.01]"
              : "border-white/10 hover:border-brand/40 hover:bg-[#1C1B1B]",
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
              <Loader2 className="h-10 w-10 animate-spin text-brand" />
              <p className="mt-3 font-mono text-xs text-brand uppercase tracking-widest">UPLOADING_VIDEO_STREAM…</p>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 border border-brand/20">
                <Upload className="h-7 w-7 text-brand" />
              </div>
              <p className="mt-4 font-mono text-xs font-bold text-textPrimary uppercase tracking-wider">
                Drag & drop video binary
              </p>
              <p className="mt-1 font-mono text-[9px] text-textMuted uppercase tracking-widest">or click to browse · MP4, WebM, MOV</p>
            </>
          )}
        </div>

        {/* Preview + metadata */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded border border-white/5 bg-black/60">
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
              <div className="flex aspect-video flex-col items-center justify-center gap-2 text-textMuted font-mono">
                <Film className="h-8 w-8 opacity-45 text-textMuted" />
                <p className="text-[10px] uppercase tracking-wider text-textMuted">No video loaded — paste link or upload file</p>
              </div>
            )}
          </div>

          <label className="block">
            <span className="flex items-center gap-2 font-mono text-[9px] text-textMuted uppercase tracking-widest">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-brand" />
              YouTube or Hosted Video Stream URL
            </span>
            <input
              className="mt-1.5 w-full rounded border border-white/5 bg-[#1C1B1B] px-3 py-2.5 font-mono text-xs text-textPrimary placeholder:text-textMuted outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 uppercase tracking-wide"
              value={videoUrl}
              onChange={(e) => onVideoUrlChange(e.target.value)}
              placeholder="HTTPS://WWW.YOUTUBE.COM/WATCH?V=…"
            />
          </label>

          {isYoutube && videoUrl.trim() ? (
            <div className="rounded border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 font-mono text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                YouTube detected — not recommended for paid courses
              </p>
              <p className="mt-1 text-[10px] leading-5 text-textMuted normal-case">
                Students can still find the source video on YouTube. Upload an MP4 to Cloudflare R2 for
                secure, Udemy-style playback without sharing links.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[9px] text-textMuted uppercase tracking-widest">Duration (Seconds)</span>
              <input
                type="number"
                min={0}
                className="mt-1.5 w-full rounded border border-white/5 bg-[#1C1B1B] px-3 py-2.5 font-mono text-xs text-textPrimary placeholder:text-textMuted outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 tracking-wide"
                value={durationSeconds}
                onChange={(e) =>
                  onDurationChange(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </label>
            <div className="flex flex-col justify-end font-mono">
              <p className="text-[9px] text-textMuted uppercase tracking-widest">Calculated Time</p>
              <p className="text-base font-extrabold text-brand tracking-widest mt-1">
                {typeof durationSeconds === "number" && durationSeconds > 0
                  ? formatDuration(durationSeconds)
                  : "--:--"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
