"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  showLabel?: boolean;
};

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div className={cn("h-9 w-9 rounded-lg bg-overlay-hover", className)} aria-hidden />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-textSecondary outline-none transition hover:bg-overlay-hover hover:text-textPrimary focus-visible:ring-2 focus-visible:ring-brand/30",
        showLabel && "h-auto w-auto gap-2 px-3",
        className,
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel ? (
        <span className="text-xs font-medium">{isDark ? "Light" : "Dark"}</span>
      ) : null}
    </button>
  );
}
