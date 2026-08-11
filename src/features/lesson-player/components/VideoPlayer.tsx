"use client";

import { useCallback, useRef } from "react";

import { useLessonProgress } from "@/hooks/progress/use-lesson-progress";
import { saveLessonComplete } from "@/lib/learning/progress";
import { toYoutubeEmbedUrl } from "@/lib/video/video-url";
import { CheckCircle2 } from "lucide-react";

type VideoPlayerProps = {
  lessonId: string;
  courseId: string;
  userId: string;
  videoUrl: string;
  title: string;
  minWatchPercent?: number;
  onComplete?: () => void;
};

/**
 * HTML5 video player with 75% auto-complete (S8 / S9).
 * Uses progress API when available; falls back to localStorage in dev without DB.
 */
export function VideoPlayer({
  lessonId,
  courseId,
  userId,
  videoUrl,
  title,
  minWatchPercent = 75,
  onComplete,
}: VideoPlayerProps) {
  const { sendHeartbeat, completed: serverCompleted, markComplete, isMarking } =
    useLessonProgress(lessonId);
  const completedRef = useRef(false);
  const lastSentRef = useRef(0);

  const markLocalComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    saveLessonComplete(userId, courseId, lessonId);
    onComplete?.();
  }, [courseId, lessonId, onComplete, userId]);

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = event.currentTarget;
    const duration = el.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const watchedSeconds = el.currentTime;
    const watchPercent = (watchedSeconds / duration) * 100;

    if (watchPercent >= minWatchPercent) {
      markLocalComplete();
    }

    if (serverCompleted || completedRef.current) return;

    const now = Date.now();
    if (now - lastSentRef.current < 5000) return;
    lastSentRef.current = now;

    sendHeartbeat({
      watchedSeconds,
      durationSeconds: duration,
    });
  };

  const embedUrl = toYoutubeEmbedUrl(videoUrl);

  if (embedUrl) {
    const handleYoutubeComplete = async () => {
      if (completedRef.current || serverCompleted) return;
      completedRef.current = true;
      try {
        await markComplete();
      } catch {
        markLocalComplete();
      }
      onComplete?.();
    };

    return (
      <div className="bg-black">
        <iframe
          src={embedUrl}
          title={title}
          className="aspect-video w-full bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        <div className="flex flex-col items-center gap-2 border-t border-white/10 bg-black px-3 py-3 sm:flex-row sm:justify-between sm:px-4">
          <p className="text-center text-[11px] leading-relaxed text-textMuted sm:text-left sm:text-xs">
            Protected course content — do not share or redistribute this lesson.
          </p>
          {!serverCompleted && !completedRef.current ? (
            <button
              type="button"
              onClick={() => void handleYoutubeComplete()}
              disabled={isMarking}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isMarking ? "Saving…" : "Mark as complete"}
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

  return (
    <div className="bg-black p-0 sm:p-3">
      <video
        src={videoUrl}
        controls
        className="aspect-video w-full bg-black"
        onTimeUpdate={handleTimeUpdate}
        onEnded={markLocalComplete}
      >
        <track kind="captions" />
      </video>
    </div>
  );
}
