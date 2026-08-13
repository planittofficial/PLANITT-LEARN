"use client";

import { useEffect, type RefObject } from "react";

type UseCourseVideoShortcutsOptions = {
  enabled: boolean;
  containerRef: RefObject<HTMLElement | null>;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function getActiveFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.msFullscreenElement ?? null;
}

function isPlayerActive(container: HTMLElement): boolean {
  const fs = getActiveFullscreenElement();
  // Stage-only fullscreen: fullscreen element may be a child of the player shell
  if (fs === container || (fs instanceof Node && container.contains(fs))) return true;
  if (container === document.activeElement) return true;
  if (container.contains(document.activeElement)) return true;
  return false;
}

export function useCourseVideoShortcuts({
  enabled,
  containerRef,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle,
}: UseCourseVideoShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const node = containerRef.current;
      if (!node || !isPlayerActive(node)) return;

      const maxTime = duration > 0 ? duration : Number.POSITIVE_INFINITY;

      switch (event.key) {
        case " ":
        case "k":
        case "K":
          event.preventDefault();
          onPlayPause();
          break;
        case "ArrowLeft":
          event.preventDefault();
          onSeek(Math.max(0, currentTime - 5));
          break;
        case "ArrowRight":
          event.preventDefault();
          onSeek(Math.min(maxTime, currentTime + 5));
          break;
        case "ArrowUp":
          event.preventDefault();
          onVolumeChange(Math.min(100, volume + 5));
          break;
        case "ArrowDown":
          event.preventDefault();
          onVolumeChange(Math.max(0, volume - 5));
          break;
        case "m":
        case "M":
          event.preventDefault();
          onMuteToggle();
          break;
        case "f":
        case "F":
          event.preventDefault();
          onFullscreenToggle();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    containerRef,
    currentTime,
    duration,
    enabled,
    onFullscreenToggle,
    onMuteToggle,
    onPlayPause,
    onSeek,
    onVolumeChange,
    volume,
  ]);
}
