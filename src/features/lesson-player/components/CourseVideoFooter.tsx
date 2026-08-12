"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type CourseVideoFooterProps = {
  completed: boolean;
  isMarking: boolean;
  onMarkComplete: () => void;
};

export function CourseVideoFooter({
  completed,
  isMarking,
  onMarkComplete,
}: CourseVideoFooterProps) {
  return (
    <div className="flex flex-col items-center gap-2 border-t border-white/10 bg-black px-3 py-3 sm:flex-row sm:justify-between sm:px-4">
      <p className="text-center text-[11px] leading-relaxed text-textMuted sm:text-left sm:text-xs">
        Protected course content — sharing links is not permitted.
      </p>
      {!completed ? (
        <button
          type="button"
          onClick={onMarkComplete}
          disabled={isMarking}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brandForeground transition hover:bg-brandHover disabled:opacity-60",
          )}
        >
          {isMarking ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark as complete
            </>
          )}
        </button>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
        </span>
      )}
    </div>
  );
}
