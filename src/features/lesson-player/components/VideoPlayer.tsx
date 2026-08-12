"use client";

import { useCallback, useRef } from "react";
import { Loader2, ShieldAlert, Video } from "lucide-react";

import { CourseVideoFooter } from "@/features/lesson-player/components/CourseVideoFooter";
import { ProtectedHtml5Player } from "@/features/lesson-player/components/ProtectedHtml5Player";
import { SecureYoutubePlayer } from "@/features/lesson-player/components/SecureYoutubePlayer";
import { useLessonPlayback } from "@/hooks/progress/use-lesson-playback";
import { useLessonProgress } from "@/hooks/progress/use-lesson-progress";
import { saveLessonComplete } from "@/lib/learning/progress";

type VideoPlayerProps = {
  lessonId: string;
  courseId: string;
  userId: string;
  title: string;
  minWatchPercent?: number;
  onComplete?: () => void;
};

/**
 * Fetches playback from an authenticated API so video URLs are not exposed in course JSON.
 */
export function VideoPlayer({
  lessonId,
  courseId,
  userId,
  title,
  minWatchPercent = 75,
  onComplete,
}: VideoPlayerProps) {
  const playbackQuery = useLessonPlayback(lessonId, Boolean(userId));
  const { completed: serverCompleted, markComplete, isMarking } = useLessonProgress(lessonId);
  const completedRef = useRef(false);

  const markDone = useCallback(async () => {
    if (completedRef.current || serverCompleted) return;
    completedRef.current = true;
    try {
      await markComplete();
    } catch {
      saveLessonComplete(userId, courseId, lessonId);
    }
    onComplete?.();
  }, [courseId, lessonId, markComplete, onComplete, serverCompleted, userId]);

  if (playbackQuery.isLoading) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-black text-textMuted">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (playbackQuery.isError || !playbackQuery.data) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-6 text-center text-sm text-amber-200">
        <ShieldAlert className="h-8 w-8" />
        Video playback is unavailable. Refresh the page or contact support.
      </div>
    );
  }

  const playback = playbackQuery.data;
  const completed = serverCompleted || completedRef.current;

  if (playback.provider === "youtube") {
    return (
      <SecureYoutubePlayer
        videoId={playback.videoId}
        thumbnailUrl={playback.thumbnailUrl}
        title={title}
        completed={completed}
        isMarking={isMarking}
        onMarkComplete={() => void markDone()}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-borderSubtle bg-black shadow-card">
      <ProtectedHtml5Player
        lessonId={lessonId}
        courseId={courseId}
        userId={userId}
        streamUrl={playback.streamUrl}
        title={title}
        minWatchPercent={minWatchPercent}
        onComplete={onComplete}
      />
      <CourseVideoFooter
        completed={completed}
        isMarking={isMarking}
        onMarkComplete={() => void markDone()}
      />
    </div>
  );
}

export function VideoUnavailablePlaceholder() {
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-borderSubtle bg-black text-sm text-textMuted">
      <Video className="h-8 w-8 opacity-30 text-brand" />
      Sign in to watch this lesson.
    </div>
  );
}
