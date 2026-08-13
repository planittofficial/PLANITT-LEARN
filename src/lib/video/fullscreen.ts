/** Fullscreen helpers with vendor-prefixed fallbacks for mobile Safari / older Chromium. */

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

export function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.msFullscreenElement ?? null;
}

export function isElementFullscreen(element: HTMLElement | null): boolean {
  if (!element) return false;
  return getFullscreenElement() === element;
}

export async function enterFullscreen(element: HTMLElement): Promise<void> {
  const anyEl = element as FullscreenElement;

  if (element.requestFullscreen) {
    await element.requestFullscreen();
    return;
  }
  if (anyEl.webkitRequestFullscreen) {
    await anyEl.webkitRequestFullscreen();
    return;
  }
  if (anyEl.msRequestFullscreen) {
    await anyEl.msRequestFullscreen();
  }
}

export async function exitFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;

  if (document.fullscreenElement && document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
    return;
  }
  if (doc.msExitFullscreen) {
    await doc.msExitFullscreen();
  }
}

export async function toggleElementFullscreen(element: HTMLElement | null): Promise<boolean> {
  if (!element) return false;
  try {
    if (isElementFullscreen(element)) {
      await exitFullscreen();
      return false;
    }
    await enterFullscreen(element);
    return true;
  } catch {
    return isElementFullscreen(element);
  }
}

export function subscribeFullscreenChange(onChange: () => void): () => void {
  document.addEventListener("fullscreenchange", onChange);
  document.addEventListener("webkitfullscreenchange", onChange as EventListener);
  document.addEventListener("MSFullscreenChange", onChange as EventListener);
  return () => {
    document.removeEventListener("fullscreenchange", onChange);
    document.removeEventListener("webkitfullscreenchange", onChange as EventListener);
    document.removeEventListener("MSFullscreenChange", onChange as EventListener);
  };
}
