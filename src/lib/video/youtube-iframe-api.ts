type YoutubeIframeApiWindow = Window &
  typeof globalThis & {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: Record<string, unknown>,
      ) => YoutubePlayerInstance;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  };

export type YoutubePlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getPlayerState: () => number;
  destroy: () => void;
  getPlaybackRate?: () => number;
  setPlaybackRate?: (rate: number) => void;
  getAvailablePlaybackRates?: () => number[];
  getPlaybackQuality?: () => string;
  setPlaybackQuality?: (quality: string) => void;
  getAvailableQualityLevels?: () => string[];
};

export const YT_PLAYER_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

let loadPromise: Promise<void> | null = null;

function getWindow(): YoutubeIframeApiWindow {
  return window as YoutubeIframeApiWindow;
}

/** Load the YouTube IFrame API once for chromeless, API-driven playback. */
export function loadYoutubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube IFrame API requires a browser"));
  }

  const win = getWindow();
  if (win.YT?.Player) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const previousReady = win.onYouTubeIframeAPIReady;

    win.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    if (document.getElementById("youtube-iframe-api")) return;

    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load YouTube IFrame API"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function buildChromelessPlayerVars(origin: string): Record<string, string | number> {
  return {
    autoplay: 1,
    controls: 0,
    modestbranding: 1,
    rel: 0,
    iv_load_policy: 3,
    playsinline: 1,
    disablekb: 1,
    fs: 0,
    enablejsapi: 1,
    origin,
    widget_referrer: origin,
  };
}

export const DEFAULT_PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const QUALITY_LABELS: Record<string, string> = {
  auto: "Auto",
  default: "Auto",
  tiny: "144p",
  small: "240p",
  medium: "360p",
  large: "480p",
  hd720: "720p",
  hd1080: "1080p",
  hd1440: "1440p",
  hd2160: "2160p",
  highres: "Original",
};

export function youtubeQualityLabel(quality: string): string {
  return QUALITY_LABELS[quality] ?? quality;
}

export function html5QualityFromHeight(height: number): { id: string; label: string } {
  if (height >= 2160) return { id: "2160p", label: "2160p" };
  if (height >= 1440) return { id: "1440p", label: "1440p" };
  if (height >= 1080) return { id: "1080p", label: "1080p" };
  if (height >= 720) return { id: "720p", label: "720p" };
  if (height >= 480) return { id: "480p", label: "480p" };
  if (height >= 360) return { id: "360p", label: "360p" };
  if (height > 0) return { id: `${height}p`, label: `${height}p` };
  return { id: "auto", label: "Auto" };
}
