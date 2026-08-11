"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Play, Shield } from "lucide-react";

import { cn } from "@/lib/utils";

type SecureYoutubePlayerProps = {
  embedUrl: string;
  thumbnailUrl: string;
  title: string;
  completed: boolean;
  isMarking: boolean;
  onMarkComplete: () => void;
};

export function SecureYoutubePlayer({
  embedUrl,
  thumbnailUrl,
  title,
  completed,
  isMarking,
  onMarkComplete,
}: SecureYoutubePlayerProps) {
  const [started, setStarted] = useState(false);
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : "",
  );

  const secureSrc =
    origin && !embedUrl.includes("origin=")
      ? `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}origin=${encodeURIComponent(origin)}`
      : embedUrl;

  return (
    <div
      className="secure-video-shell relative bg-black"
      onContextMenu={(event) => event.preventDefault()}
    >
      {!started ? (
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="group relative block aspect-video w-full overflow-hidden text-left"
          aria-label={`Play lesson: ${title}`}
        >
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:scale-[1.02] group-hover:opacity-90"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand text-brandForeground shadow-lg transition group-hover:scale-105">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Course lecture
              </p>
              <p className="mt-2 max-w-xl font-headline text-lg font-semibold text-white sm:text-xl">
                {title}
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-white/70">
              <Shield className="h-3.5 w-3.5" />
              Enrolled playback only
            </p>
          </div>
        </button>
      ) : (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={secureSrc}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
          {/* Block share / watch-on-youtube hotspots in the native player chrome */}
          <div className="video-shield-top-right pointer-events-auto" aria-hidden="true" />
          <div className="video-shield-bottom-left pointer-events-auto" aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-col items-center gap-2 border-t border-white/10 bg-black px-3 py-3 sm:flex-row sm:justify-between sm:px-4">
        <p className="text-center text-[11px] leading-relaxed text-textMuted sm:text-left sm:text-xs">
          Protected course content — sharing links is not permitted.
        </p>
        {!completed ? (
          <button
            type="button"
            onClick={onMarkComplete}
            disabled={isMarking}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brandForeground transition hover:bg-brandHover disabled:opacity-60",
            )}
          >
            {isMarking ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as complete
              </>
            )}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        )}
      </div>
    </div>
  );
}
