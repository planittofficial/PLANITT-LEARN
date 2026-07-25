"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, Loader2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { QuizAnswer, QuizAttemptResult, QuizPublicView } from "@/types/quiz.types";

type LessonQuizPanelProps = {
  quiz: QuizPublicView;
  onSubmit: (answers: QuizAnswer[]) => Promise<QuizAttemptResult | null>;
  isSubmitting?: boolean;
  result?: QuizAttemptResult | null;
};

export function LessonQuizPanel({
  quiz,
  onSubmit,
  isSubmitting,
  result,
}: LessonQuizPanelProps) {
  const [selections, setSelections] = useState<Record<string, number>>({});

  const allAnswered = quiz.questions.every((q) => selections[q.id] !== undefined);

  const handleSubmit = async () => {
    if (!allAnswered || isSubmitting) return;
    const answers: QuizAnswer[] = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: selections[q.id]!,
    }));
    await onSubmit(answers);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-borderSubtle bg-surface shadow-card">
      <div className="border-b border-borderSubtle px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-textPrimary">
              {quiz.title?.trim() || "Lesson quiz"}
            </h2>
            <p className="text-xs text-textSecondary">
              {quiz.questions.length} questions - pass score {quiz.passingScore}%
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5">
        {result ? (
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border px-4 py-3",
              result.passed
                ? "border-brand/30 bg-brand/10"
                : "border-rose-500/30 bg-rose-500/10",
            )}
          >
            {result.passed ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            )}
            <div>
              <p className="font-semibold text-textPrimary">
                {result.passed ? "Quiz passed!" : "Not quite - try again"}
              </p>
              <p className="mt-1 text-sm text-textSecondary">
                Score: {result.score}/{result.maxScore} ({result.correctCount}/
                {result.totalQuestions} correct)
              </p>
            </div>
          </div>
        ) : null}

        {quiz.questions.map((question, index) => (
          <fieldset key={question.id} className="space-y-3">
            <legend className="text-sm font-medium text-textPrimary">
              {index + 1}. {question.prompt}
            </legend>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => {
                const selected = selections[question.id] === optionIndex;
                return (
                  <label
                    key={`${question.id}-${optionIndex}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition",
                      selected
                        ? "border-brand bg-brand/10 text-textPrimary"
                        : "border-borderSubtle hover:border-brand/30 hover:bg-overlay-faint",
                      result && "pointer-events-none opacity-80",
                    )}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={selected}
                      onChange={() =>
                        setSelections((prev) => ({ ...prev, [question.id]: optionIndex }))
                      }
                      className="accent-brand"
                      disabled={Boolean(result)}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        {!result ? (
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!allAnswered || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground transition hover:bg-brandHover disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit quiz"
            )}
          </button>
        ) : null}
      </div>
    </section>
  );
}
