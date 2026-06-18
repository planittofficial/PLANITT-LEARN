export type LessonProgressState = {
  lessonId: string;
  watchedSeconds: number;
  watchPercent: number;
  completed: boolean;
  completedAt: string | null;
};

export type WatchHeartbeatInput = {
  watchedSeconds: number;
  durationSeconds: number;
};

export type WatchHeartbeatResult = {
  watchPercent: number;
  completed: boolean;
  watchedSeconds: number;
  minWatchPercent: number;
};
