"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Shield } from "lucide-react";

import { CourseVideoControls } from "@/features/lesson-player/components/CourseVideoControls";
import { CourseVideoFooter } from "@/features/lesson-player/components/CourseVideoFooter";
import { useCourseVideoShortcuts } from "@/hooks/progress/use-course-video-shortcuts";
import {
  buildChromelessPlayerVars,
  DEFAULT_PLAYBACK_RATES,
  loadYoutubeIframeApi,
  youtubeQualityLabel,
  YT_PLAYER_STATE,
  type YoutubePlayerInstance,
} from "@/lib/video/youtube-iframe-api";

function refreshQualityOptions(
  player: YoutubePlayerInstance,
  setQuality: (quality: string) => void,
  setQualities: (qualities: { id: string; label: string }[]) => void,
) {
  const levels = player.getAvailableQualityLevels?.() ?? [];
  const unique = Array.from(new Set(["auto", ...levels.filter((level) => level && level !== "unknown")]));
  setQualities(unique.map((id) => ({ id, label: youtubeQualityLabel(id) })));
  const current = player.getPlaybackQuality?.();
  setQuality(current && current !== "unknown" ? current : "auto");
}

type SecureYoutubePlayerProps = {
  videoId: string;
  thumbnailUrl: string;
  title: string;
  completed: boolean;
  isMarking: boolean;
  onMarkComplete: () => void;
};

export function SecureYoutubePlayer({
  videoId,
  thumbnailUrl,
  title,
  completed,
  isMarking,
  onMarkComplete,
}: SecureYoutubePlayerProps) {
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playbackRates, setPlaybackRates] = useState<number[]>(DEFAULT_PLAYBACK_RATES);
  const [quality, setQuality] = useState("auto");
  const [qualities, setQualities] = useState([{ id: "auto", label: "Auto" }]);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YoutubePlayerInstance | null>(null);
  const tickRef = useRef<number | null>(null);

  const stopTick = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    stopTick();
    tickRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const nextTime = player.getCurrentTime();
      const nextDuration = player.getDuration();
      if (Number.isFinite(nextTime)) setCurrentTime(nextTime);
      if (Number.isFinite(nextDuration) && nextDuration > 0) setDuration(nextDuration);
    }, 250);
  }, [stopTick]);

  useEffect(() => {
    if (!started || !playerHostRef.current) return;

    let cancelled = false;

    void loadYoutubeIframeApi()
      .then(() => {
        if (cancelled || !playerHostRef.current) return;

        const origin = window.location.origin;
        const YT = (window as Window & { YT?: { Player: new (...args: unknown[]) => YoutubePlayerInstance } }).YT;
        if (!YT?.Player) {
          setError("Video player failed to initialize.");
          return;
        }

        playerRef.current = new YT.Player(playerHostRef.current, {
          videoId,
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          playerVars: buildChromelessPlayerVars(origin),
          events: {
            onReady: (event: { target: YoutubePlayerInstance }) => {
              if (cancelled) return;
              playerRef.current = event.target;
              const initialDuration = event.target.getDuration();
              if (Number.isFinite(initialDuration) && initialDuration > 0) {
                setDuration(initialDuration);
              }
              const rates = event.target.getAvailablePlaybackRates?.() ?? DEFAULT_PLAYBACK_RATES;
              if (rates.length) setPlaybackRates(rates);
              const currentRate = event.target.getPlaybackRate?.();
              if (currentRate) setPlaybackRate(currentRate);
              refreshQualityOptions(event.target, setQuality, setQualities);
              setReady(true);
              setPlaying(true);
              startTick();
            },
            onStateChange: (event: { data: number; target: YoutubePlayerInstance }) => {
              if (cancelled) return;
              const state = event.data;
              setPlaying(state === YT_PLAYER_STATE.PLAYING);
              setBuffering(state === YT_PLAYER_STATE.BUFFERING);
              if (state === YT_PLAYER_STATE.PLAYING) {
                refreshQualityOptions(event.target, setQuality, setQualities);
                startTick();
              }
              if (state === YT_PLAYER_STATE.PAUSED || state === YT_PLAYER_STATE.ENDED) stopTick();
            },
            onError: () => {
              if (!cancelled) setError("This video cannot be played right now.");
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load the video player.");
      });

    return () => {
      cancelled = true;
      stopTick();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [started, startTick, stopTick, videoId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handlePlayPause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    const state = player.getPlayerState();
    if (state === YT_PLAYER_STATE.PLAYING) {
      player.pauseVideo();
      setPlaying(false);
      stopTick();
      return;
    }
    player.playVideo();
    setPlaying(true);
    startTick();
  }, [startTick, stopTick]);

  const handleSeek = useCallback(
    (time: number) => {
      const player = playerRef.current;
      if (!player) return;
      player.seekTo(time, true);
      setCurrentTime(time);
    },
    [],
  );

  const handleVolumeChange = useCallback((nextVolume: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.setVolume(nextVolume);
    if (nextVolume > 0 && player.isMuted()) player.unMute();
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
  }, []);

  const handleMuteToggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted() || volume === 0) {
      player.unMute();
      if (volume === 0) player.setVolume(80);
      setMuted(false);
      if (volume === 0) setVolume(80);
      return;
    }
    player.mute();
    setMuted(true);
  }, [volume]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    const player = playerRef.current;
    player?.setPlaybackRate?.(rate);
    setPlaybackRate(rate);
  }, []);

  const handleQualityChange = useCallback((nextQuality: string) => {
    const player = playerRef.current;
    player?.setPlaybackQuality?.(nextQuality);
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

  useCourseVideoShortcuts({
    enabled: started && ready && !error,
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
    if (started && ready && containerRef.current) {
      containerRef.current.focus({ preventScroll: true });
    }
  }, [ready, started]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="secure-video-shell overflow-hidden rounded-xl border border-borderSubtle bg-black shadow-card outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
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
        <div ref={stageRef} className="course-video-stage relative aspect-video w-full bg-black">
          <div ref={playerHostRef} className="course-video-youtube-host absolute inset-0" />

          {!ready && !error ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 text-sm text-white/70">
              Loading video…
            </div>
          ) : null}

          {error ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black px-6 text-center text-sm text-amber-200">
              {error}
            </div>
          ) : null}

          {/* Block any residual YouTube chrome that may appear in embed mode */}
          <div className="course-video-brand-mask-top pointer-events-none" aria-hidden="true" />
          <div className="course-video-brand-mask-bottom-right pointer-events-none" aria-hidden="true" />

          {ready && !error ? (
            <button
              type="button"
              onClick={() => {
                handlePlayPause();
                containerRef.current?.focus({ preventScroll: true });
              }}
              className="absolute inset-0 z-[15] cursor-pointer bg-transparent"
              aria-label={playing ? "Pause video" : "Play video"}
            />
          ) : null}

          {ready && !error ? (
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
              playbackRates={playbackRates}
              onPlaybackRateChange={handlePlaybackRateChange}
              quality={quality}
              qualities={qualities}
              onQualityChange={handleQualityChange}
              onFocusPlayer={() => containerRef.current?.focus({ preventScroll: true })}
              className="absolute inset-x-0 bottom-0 z-20"
            />
          ) : null}
        </div>
      )}

      <CourseVideoFooter
        completed={completed}
        isMarking={isMarking}
        onMarkComplete={onMarkComplete}
      />
    </div>
  );
}
