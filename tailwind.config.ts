import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        appBase: "var(--bg-base)",
        surface: "var(--bg-surface)",
        brand: "var(--brand)",
        brandHover: "var(--brand-hover)",
        brandBright: "var(--brand-bright)",
        brandForeground: "var(--brand-foreground)",
        elevated: "var(--bg-elevated)",
        accent: "var(--accent)",
        accentBright: "var(--accent-bright)",
        accentSubtle: "var(--accent-subtle)",
        borderSubtle: "var(--border-subtle)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
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
