"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, Loader2, XCircle, ChevronLeft, ChevronRight, Zap, Trophy, ShieldAlert } from "lucide-react";

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
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [confidence, setConfidence] = useState<Record<string, "low" | "medium" | "high">>({});
  const [showSummary, setShowSummary] = useState(false);

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentIdx];
  const selectedOption = selections[currentQuestion?.id];
  const allAnswered = quiz.questions.every((q) => selections[q.id] !== undefined);

  const handleOptionSelect = (optionIndex: number) => {
    if (result) return;
    setSelections((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
    // Initialize default confidence
    if (!confidence[currentQuestion.id]) {
      setConfidence((prev) => ({ ...prev, [currentQuestion.id]: "medium" }));
    }
  };

  const handleConfidenceSelect = (level: "low" | "medium" | "high") => {
    if (result) return;
    setConfidence((prev) => ({ ...prev, [currentQuestion.id]: level }));
  };

  const nextQuestion = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered || isSubmitting) return;
    const answers: QuizAnswer[] = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: selections[q.id]!,
    }));
    const res = await onSubmit(answers);
    if (res) {
      setShowSummary(true);
    }
  };

  const resetQuiz = () => {
    setSelections({});
    setConfidence({});
    setCurrentIdx(0);
    setShowSummary(false);
  };

  // If a result is present and we want to show summary
  if (result && (showSummary || !allAnswered)) {
    const passed = result.passed;
    const scorePct = Math.round((result.score / result.maxScore) * 100);

    return (
      <section className="overflow-hidden rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md shadow-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              passed ? "bg-brand/10 text-brand" : "bg-rose-500/10 text-rose-400"
            )}>
              {passed ? <Trophy className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="font-headline text-2xl font-extrabold text-textPrimary uppercase tracking-tight">Evaluation Report</h2>
              <p className="font-mono text-xs text-textSecondary uppercase tracking-wider mt-0.5">
                Evaluation status: {passed ? "PASSED" : "FAILED"}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="text-right">
              <span className="font-mono text-[9px] text-textSecondary block uppercase tracking-widest">System_score</span>
              <span className={cn("font-mono text-3xl font-bold", passed ? "text-brand" : "text-rose-400")}>
                {scorePct}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={cn(
            "p-5 rounded border flex items-start gap-4",
            passed ? "border-brand/20 bg-brand/5" : "border-rose-500/25 bg-rose-500/5"
          )}>
            {passed ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-brand mt-0.5 animate-pulse" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            )}
            <div>
              <h4 className="font-headline font-bold text-textPrimary text-base uppercase tracking-tight">
                {passed ? "Evaluation Completed Successfully" : "Imbalances Detected in Core Framework"}
              </h4>
              <p className="text-sm text-textSecondary leading-relaxed mt-1">
                {passed 
                  ? `Congratulations! You answered ${result.correctCount} of ${result.totalQuestions} questions correctly and surpassed the passing score of ${quiz.passingScore}%.`
                  : `You scored ${result.score} out of ${result.maxScore} (${result.correctCount}/${result.totalQuestions} correct answers). Review the curriculum concepts and retry the evaluation.`}
              </p>
            </div>
          </div>

          <div className="border border-white/5 bg-black/40 p-6 rounded font-mono text-[11px] leading-relaxed terminal-glow">
            <p className="text-brand/60 mb-2 uppercase font-bold tracking-widest">&gt; BREAKDOWN_REPORT.LOG</p>
            {quiz.questions.map((q, idx) => {
              const selected = selections[q.id];
              return (
                <div key={q.id} className="py-2 border-b border-white/5 last:border-0">
                  <p className="text-textPrimary font-semibold">Q{idx + 1}: {q.prompt}</p>
                  <p className="text-textSecondary mt-1">
                    Your Selection: <span className={selected !== undefined ? "text-textPrimary" : "text-textMuted"}>
                      {selected !== undefined ? q.options[selected] : "Unanswered"}
                    </span>
                  </p>
                  <p className="text-brand/70 font-semibold mt-0.5">
                    Confidence: <span className="uppercase text-brand">{confidence[q.id] || "medium"}</span>
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={resetQuiz}
              className="bg-brand text-black px-6 py-3 rounded font-mono text-xs font-bold transition hover:brightness-110 active:scale-95 tracking-widest uppercase shadow-[0_0_12px_rgba(20,184,166,0.15)]"
            >
              RETRY_EVALUATION
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Quiz step wizard
  const optionPrefixes = ["A", "B", "C", "D", "E"];

  return (
    <section className="overflow-hidden rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-textPrimary text-base uppercase tracking-tight">
              {quiz.title?.trim() || "Lesson quiz"}
            </h2>
            <p className="text-[10px] text-textSecondary font-mono uppercase tracking-wider mt-0.5">
              PASS_SCORE: {quiz.passingScore}% · QUESTION_{currentIdx + 1}_OF_{totalQuestions}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-1">
        <div 
          className="bg-brand h-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-base font-semibold text-textPrimary leading-snug">
            <span className="font-mono text-brand mr-2">Q{currentIdx + 1}.</span> 
            {currentQuestion?.prompt}
          </legend>
          
          <div className="space-y-3">
            {currentQuestion?.options.map((option, optionIndex) => {
              const selected = selectedOption === optionIndex;
              return (
                <button
                  key={`${currentQuestion.id}-${optionIndex}`}
                  type="button"
                  onClick={() => handleOptionSelect(optionIndex)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-4 rounded border px-4 py-3.5 text-left text-sm transition-all duration-200",
                    selected
                      ? "border-brand bg-brand/5 text-textPrimary font-semibold shadow-[0_0_12px_rgba(20,184,166,0.1)]"
                      : "border-white/5 bg-[#1C1B1B]/40 text-textSecondary hover:border-brand/40 hover:bg-white/5"
                  )}
                >
                  <span className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs border transition-all duration-200",
                    selected
                      ? "bg-brand text-black border-brand font-bold"
                      : "bg-[#1C1B1B] border-white/5 text-textSecondary"
                  )}>
                    {optionPrefixes[optionIndex]}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Confidence Indicator Widgets (only when option is selected) */}
        {selectedOption !== undefined && (
          <div className="pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
            <p className="font-mono text-[9px] text-textSecondary uppercase tracking-widest mb-2 font-bold">Select_Confidence_Level</p>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((level) => {
                const active = confidence[currentQuestion.id] === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleConfidenceSelect(level)}
                    className={cn(
                      "flex-1 py-2 rounded font-mono text-[10px] uppercase font-bold border transition-all duration-150 active:scale-95",
                      active
                        ? level === "low"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                          : level === "medium"
                            ? "bg-brand/10 text-brand border-brand/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                        : "bg-transparent border-white/5 text-textSecondary hover:bg-white/5"
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation / Action buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-8">
          <button
            type="button"
            onClick={prevQuestion}
            disabled={currentIdx === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-bold text-textSecondary hover:text-textPrimary disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="h-4 w-4" />
            BACK
          </button>

          {currentIdx === totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!allAnswered || isSubmitting}
              className="inline-flex items-center gap-2 rounded bg-brand px-6 py-3 font-mono text-xs font-bold text-black uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_12px_rgba(20,184,166,0.15)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                <>
                  SUBMIT_EVALUATION
                  <Zap className="h-3.5 w-3.5 fill-current" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextQuestion}
              disabled={selectedOption === undefined}
              className="inline-flex items-center gap-1.5 rounded bg-[#131313] border border-white/5 px-5 py-2.5 font-mono text-xs font-bold text-textPrimary hover:border-brand/40 transition active:scale-95 disabled:opacity-40"
            >
              NEXT
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
