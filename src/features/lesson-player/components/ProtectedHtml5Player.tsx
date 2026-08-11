"use client";

import { useCallback, useRef } from "react";

import { useLessonProgress } from "@/hooks/progress/use-lesson-progress";
import { saveLessonComplete } from "@/lib/learning/progress";

type ProtectedHtml5PlayerProps = {
  lessonId: string;
  courseId: string;
  userId: string;
  streamUrl: string;
  title: string;
  minWatchPercent?: number;
  onComplete?: () => void;
};

export function ProtectedHtml5Player({
  lessonId,
  courseId,
  userId,
  streamUrl,
  title,
  minWatchPercent = 75,
  onComplete,
}: ProtectedHtml5PlayerProps) {
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

  return (
    <div
      className="secure-video-shell bg-black"
      onContextMenu={(event) => event.preventDefault()}
    >
      <video
        src={streamUrl}
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        playsInline
        className="aspect-video w-full bg-black"
        title={title}
        onTimeUpdate={handleTimeUpdate}
        onEnded={markLocalComplete}
      >
        <track kind="captions" />
      </video>
    </div>
  );
}
