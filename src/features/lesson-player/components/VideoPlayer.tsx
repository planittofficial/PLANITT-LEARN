"use client";

import { useCallback, useRef } from "react";

import { useLessonProgress } from "@/hooks/progress/use-lesson-progress";
import { saveLessonComplete } from "@/lib/learning/progress";
import { toYoutubeEmbedUrl } from "@/lib/video/video-url";

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
  const { sendHeartbeat, completed: serverCompleted } = useLessonProgress(lessonId);
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
    return (
      <div className="bg-black p-0 sm:p-3">
        <iframe
          src={embedUrl}
          title={title}
          className="aspect-video w-full bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        <p className="px-2 pt-2 text-center font-mono text-[9px] uppercase tracking-wider text-textMuted">
          Protected course content — do not share or redistribute this lesson.
        </p>
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
