import type { Config } from "tailwindcss";

function withOpacity(variableName: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
    }
    return `var(${variableName})`;
  };
}

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        headline: ["var(--font-headline)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        appBase: withOpacity("--bg-base"),
        surface: withOpacity("--bg-surface"),
        brand: withOpacity("--brand"),
        brandHover: withOpacity("--brand-hover"),
        brandBright: withOpacity("--brand-bright"),
        brandForeground: withOpacity("--brand-foreground"),
        elevated: withOpacity("--bg-elevated"),
        accent: withOpacity("--accent"),
        accentBright: withOpacity("--accent-bright"),
        accentSubtle: withOpacity("--accent-subtle"),
        borderSubtle: withOpacity("--border-subtle"),
        textPrimary: withOpacity("--text-primary"),
        textSecondary: withOpacity("--text-secondary"),
        textMuted: withOpacity("--text-muted"),
        overlay: {
          subtle: "var(--overlay-subtle)",
          medium: "var(--overlay-medium)",
          strong: "var(--overlay-strong)",
          hover: "var(--overlay-hover)",
          faint: "var(--overlay-faint)",
        },
      },
    },
  },
  plugins: [],
};

export default config;

