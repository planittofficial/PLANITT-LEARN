"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type VideoQualityOption = {
  id: string;
  label: string;
};

type CourseVideoControlsProps = {
  playing: boolean;
  buffering?: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  isFullscreen: boolean;
  playbackRate: number;
  playbackRates: number[];
  onPlaybackRateChange: (rate: number) => void;
  quality: string;
  qualities: VideoQualityOption[];
  onQualityChange: (quality: string) => void;
  className?: string;
  onFocusPlayer?: () => void;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatRate(rate: number): string {
  return rate === 1 ? "Normal" : `${rate}x`;
}

export function CourseVideoControls({
  playing,
  buffering = false,
  currentTime,
  duration,
  volume,
  muted,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle,
  isFullscreen,
  playbackRate,
  playbackRates,
  onPlaybackRateChange,
  quality,
  qualities,
  onQualityChange,
  className,
  onFocusPlayer,
}: CourseVideoControlsProps) {
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<"root" | "speed" | "quality">("root");
  const menuRef = useRef<HTMLDivElement>(null);

  const currentQualityLabel =
    qualities.find((item) => item.id === quality)?.label ?? "Auto";

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setMenuView("root");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  return (
    <div
      className={cn(
        "course-video-controls flex flex-col gap-2 border-t border-white/10 bg-gradient-to-t from-black via-black/95 to-black/80 px-3 py-3 sm:px-4",
        className,
      )}
      onPointerDown={() => onFocusPlayer?.()}
    >
      <label className="group relative flex h-6 cursor-pointer items-center py-1">
        <span className="sr-only">Seek</span>
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 100}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onInput={(event) => onSeek(Number(event.currentTarget.value))}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="course-video-seek absolute inset-0 z-10 h-full w-full cursor-pointer"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
        />
        <span className="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </span>
      </label>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPlayPause();
          }}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand hover:text-brandForeground"
          aria-label={playing ? "Pause" : "Play"}
        >
          {buffering ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : playing ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          )}
        </button>

        <span className="min-w-[5.5rem] font-mono text-[11px] tabular-nums text-white/75 sm:text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="relative ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onMuteToggle}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={muted ? 0 : volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            className="course-video-volume hidden w-20 sm:block"
            aria-label="Volume"
          />

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((open) => !open);
                setMenuView("root");
              }}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white",
                menuOpen && "bg-white/10 text-white",
              )}
              aria-label="Playback settings"
              aria-expanded={menuOpen}
            >
              <Settings className="h-4 w-4" />
            </button>

            {menuOpen ? (
              <div className="absolute bottom-10 right-0 z-30 w-52 overflow-hidden rounded-lg border border-white/10 bg-black/95 py-1 shadow-2xl backdrop-blur-md">
                {menuView === "root" ? (
                  <>
                    <SettingsRow
                      icon={<Gauge className="h-3.5 w-3.5" />}
                      label="Playback speed"
                      value={formatRate(playbackRate)}
                      onClick={() => setMenuView("speed")}
                    />
                    <SettingsRow
                      icon={<Settings className="h-3.5 w-3.5" />}
                      label="Quality"
                      value={currentQualityLabel}
                      onClick={() => setMenuView("quality")}
                    />
                  </>
                ) : null}

                {menuView === "speed" ? (
                  <SettingsList
                    title="Playback speed"
                    onBack={() => setMenuView("root")}
                    items={playbackRates.map((rate) => ({
                      id: String(rate),
                      label: formatRate(rate),
                      selected: rate === playbackRate,
                    }))}
                    onSelect={(id) => {
                      onPlaybackRateChange(Number(id));
                      setMenuOpen(false);
                      setMenuView("root");
                    }}
                  />
                ) : null}

                {menuView === "quality" ? (
                  <SettingsList
                    title="Quality"
                    onBack={() => setMenuView("root")}
                    items={qualities.map((item) => ({
                      id: item.id,
                      label: item.label,
                      selected: item.id === quality,
                    }))}
                    onSelect={(id) => {
                      onQualityChange(id);
                      setMenuOpen(false);
                      setMenuView("root");
                    }}
                  />
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onFullscreenToggle}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-white/90 transition hover:bg-white/10"
    >
      <span className="text-brand">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="text-white/50">{value}</span>
      <ChevronRight className="h-3.5 w-3.5 text-white/40" />
    </button>
  );
}

function SettingsList({
  title,
  items,
  onBack,
  onSelect,
}: {
  title: string;
  items: { id: string; label: string; selected: boolean }[];
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center gap-2 border-b border-white/10 px-3 py-2 text-left text-xs font-semibold text-white"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {title}
      </button>
      <div className="max-h-48 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-white/90 transition hover:bg-white/10"
          >
            <span className="flex h-4 w-4 items-center justify-center">
              {item.selected ? <Check className="h-3.5 w-3.5 text-brand" /> : null}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
