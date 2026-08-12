"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CourseVideoControls } from "@/features/lesson-player/components/CourseVideoControls";
import { useCourseVideoShortcuts } from "@/hooks/progress/use-course-video-shortcuts";
import { useLessonProgress } from "@/hooks/progress/use-lesson-progress";
import { saveLessonComplete } from "@/lib/learning/progress";
import {
  DEFAULT_PLAYBACK_RATES,
  html5QualityFromHeight,
} from "@/lib/video/youtube-iframe-api";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [qualities, setQualities] = useState([{ id: "auto", label: "Auto" }]);

  const markLocalComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    saveLessonComplete(userId, courseId, lessonId);
    onComplete?.();
  }, [courseId, lessonId, onComplete, userId]);

  const handleTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;

    setCurrentTime(el.currentTime);
    if (Number.isFinite(el.duration) && el.duration > 0) {
      setDuration(el.duration);
    }

    const watchPercent = el.duration > 0 ? (el.currentTime / el.duration) * 100 : 0;
    if (watchPercent >= minWatchPercent) {
      markLocalComplete();
    }

    if (serverCompleted || completedRef.current) return;

    const now = Date.now();
    if (now - lastSentRef.current < 5000) return;
    lastSentRef.current = now;

    sendHeartbeat({
      watchedSeconds: el.currentTime,
      durationSeconds: el.duration,
    });
  }, [markLocalComplete, minWatchPercent, sendHeartbeat, serverCompleted]);

  const handlePlayPause = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
      return;
    }
    el.pause();
    setPlaying(false);
  }, []);

  const handleSeek = useCallback((time: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback((nextVolume: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.volume = nextVolume / 100;
    el.muted = nextVolume === 0;
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
  }, []);

  const handleMuteToggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.muted || el.volume === 0) {
      el.muted = false;
      if (el.volume === 0) el.volume = 0.8;
      setMuted(false);
      setVolume(Math.round(el.volume * 100));
      return;
    }
    el.muted = true;
    setMuted(true);
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    const el = videoRef.current;
    if (el) el.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const handleQualityChange = useCallback((nextQuality: string) => {
    setQuality(nextQuality);
  }, []);

  const handleFullscreenToggle = useCallback(async () => {
    const node = containerRef.current;
    if (!node) return;
    if (document.fullscreenElement === node) {
      await document.exitFullscreen();
      return;
    }
    await node.requestFullscreen();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useCourseVideoShortcuts({
    enabled: true,
    containerRef,
    currentTime,
    duration,
    volume,
    onPlayPause: handlePlayPause,
    onSeek: handleSeek,
    onVolumeChange: handleVolumeChange,
    onMuteToggle: handleMuteToggle,
    onFullscreenToggle: () => void handleFullscreenToggle(),
  });

  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="secure-video-shell course-video-stage relative bg-black outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
      onContextMenu={(event) => event.preventDefault()}
    >
      <video
        ref={videoRef}
        src={streamUrl}
        playsInline
        preload="metadata"
        className="aspect-video w-full cursor-pointer bg-black"
        title={title}
        onClick={() => {
          handlePlayPause();
          containerRef.current?.focus({ preventScroll: true });
        }}
        onLoadedMetadata={(event) => {
          const el = event.currentTarget;
          if (Number.isFinite(el.duration) && el.duration > 0) {
            setDuration(el.duration);
          }
          const detected = html5QualityFromHeight(el.videoHeight);
          setQualities([{ id: "auto", label: "Auto" }, detected]);
          setQuality("auto");
        }}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => {
          setPlaying(true);
          setBuffering(false);
        }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onEnded={markLocalComplete}
      >
        <track kind="captions" />
      </video>

      <CourseVideoControls
        playing={playing}
        buffering={buffering}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        muted={muted}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onFullscreenToggle={() => void handleFullscreenToggle()}
        isFullscreen={isFullscreen}
        playbackRate={playbackRate}
        playbackRates={DEFAULT_PLAYBACK_RATES}
        onPlaybackRateChange={handlePlaybackRateChange}
        quality={quality}
        qualities={qualities}
        onQualityChange={handleQualityChange}
        onFocusPlayer={() => containerRef.current?.focus({ preventScroll: true })}
        className="absolute inset-x-0 bottom-0 z-20"
      />
    </div>
  );
}
