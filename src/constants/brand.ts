/** Public brand asset paths under `/public`. */
export const BRAND = {
  name: "Alvest",
  product: "Alvest Learn",
  /** Square app icon with gold border (favicon, app icon). */
  mark: "/alvest.svg",
  /** Transparent mark — best for nav/sidebar on any background. */
  markClear: "/alvest-without-bg.svg",
  markClearPng: "/alvest-without-bg.png",
  /** Full lockup with ALVEST wordmark + tagline (login, marketing). */
  wordmark: "/alvest-logo.png",
  /** PNG favicon fallback (do not use /alvest.png — file does not exist). */
  markPng: "/alvest-without-bg.png",
} as const;
