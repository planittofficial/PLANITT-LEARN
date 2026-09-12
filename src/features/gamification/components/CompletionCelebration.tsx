"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Trophy, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type CelebrationKind = "lesson" | "module";

export type CompletionCelebrationProps = {
  open: boolean;
  kind: CelebrationKind;
  title: string;
  subtitle?: string;
  xpEarned?: number;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  onClose: () => void;
};

export function CompletionCelebration({
  open,
  kind,
  title,
  subtitle,
  xpEarned,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel = "Back to course",
  onClose,
}: CompletionCelebrationProps) {
  if (!open) return null;

  const isModule = kind === "module";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-celebration-title"
      onClick={onClose}
    >
      <div
        className={cn(
          "celebration-card relative w-full max-w-md overflow-hidden rounded-2xl border border-borderSubtle bg-surface p-6 shadow-soft sm:p-8",
          isModule && "ring-1 ring-brand/30",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-textMuted transition hover:bg-overlay-hover hover:text-textPrimary"
          aria-label="Dismiss celebration"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="celebration-confetti pointer-events-none absolute inset-x-0 top-6 flex justify-center gap-3" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-brand [animation-delay:0.05s]" />
          <span className="h-2 w-2 rounded-full bg-amber-400 [animation-delay:0.15s]" />
          <span className="h-2 w-2 rounded-full bg-sky-400 [animation-delay:0.25s]" />
          <span className="h-2 w-2 rounded-full bg-violet-400 [animation-delay:0.35s]" />
          <span className="h-2 w-2 rounded-full bg-emerald-400 [animation-delay:0.45s]" />
        </div>

        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <span className="celebration-ring absolute inset-0 rounded-full bg-brand/25" aria-hidden />
          <span
            className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-card",
              isModule
                ? "bg-gradient-to-br from-amber-400 to-brand"
                : "bg-gradient-to-br from-brand to-teal-600",
            )}
          >
            {isModule ? <Trophy className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
          </span>
        </div>

        <div className="text-center">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            {isModule ? "Module complete" : "Lesson complete"}
          </p>
          <h2
            id="completion-celebration-title"
            className="mt-2 font-headline text-2xl font-bold text-textPrimary"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-textSecondary">{subtitle}</p>
          ) : null}
          {typeof xpEarned === "number" && xpEarned > 0 ? (
            <p className="mt-3 inline-flex rounded-full bg-brand-subtle px-3 py-1 text-sm font-semibold text-brand">
              +{xpEarned} XP
            </p>
          ) : null}
        </div>

        <div className="mt-7 flex flex-col gap-2.5">
          <Link
            href={primaryHref}
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brandForeground transition hover:bg-brandHover"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {secondaryHref ? (
            <Link
              href={secondaryHref}
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-borderSubtle bg-elevated px-5 py-3 text-sm font-medium text-textSecondary transition hover:border-brand/30 hover:text-textPrimary"
            >
              {secondaryLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-borderSubtle bg-elevated px-5 py-3 text-sm font-medium text-textSecondary transition hover:border-brand/30 hover:text-textPrimary"
            >
              Keep learning
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
