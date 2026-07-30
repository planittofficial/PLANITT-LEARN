"use client";

import { useState } from "react";
import { ClipboardPaste, ChevronDown, ChevronUp } from "lucide-react";

import { AdminButton, AdminCard, AdminTextarea } from "@/features/admin-ui";
import type { QuizQuestion } from "@/types/quiz.types";

import { parseQuizPaste } from "../lib/parse-quiz-paste";

const EXAMPLE = `1. What is 2 + 2?
A) 3
B) 4
C) 5
Answer: B

2. Which planet is closest to the Sun?
A. Mercury
B. Venus
C. Earth
Correct: A`;

function toQuizQuestions(
  parsed: Array<{ prompt: string; options: string[]; correctIndex: number }>,
): QuizQuestion[] {
  return parsed.map((q) => ({
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...q,
  }));
}

export function QuizSmartPaste({
  onImport,
}: {
  onImport: (questions: QuizQuestion[], mode: "replace" | "append") => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof parseQuizPaste> | null>(null);

  function handlePreview() {
    setPreview(parseQuizPaste(text));
  }

  function handleImport(mode: "replace" | "append") {
    const result = parseQuizPaste(text);
    setPreview(result);
    if (!result.ok) return;
    onImport(toQuizQuestions(result.questions), mode);
    setText("");
    setPreview(null);
    setOpen(false);
  }

  return (
    <AdminCard highlight>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left font-mono"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded border border-brand/20 bg-brand/10 text-brand">
            <ClipboardPaste className="h-4 w-4" />
          </span>
          <div>
            <p className="font-bold text-textPrimary text-xs uppercase tracking-wide">Smart Paste Console</p>
            <p className="text-[9px] text-textMuted uppercase tracking-widest mt-0.5">
              Paste bulk questions from docs, ChatGPT, or Google Forms exports.
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-textMuted" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-textMuted" />
        )}
      </button>

      {open ? (
        <div className="mt-5 space-y-4 border-t border-white/5 pt-5">
          <details className="rounded border border-white/5 bg-[#1C1B1B] px-4 py-3 font-mono text-xs text-textMuted">
            <summary className="cursor-pointer font-bold text-brand uppercase tracking-widest">
              Supported Format Template
            </summary>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-textSecondary uppercase">
              {EXAMPLE}
            </pre>
            <p className="mt-3 text-[9px] uppercase tracking-wider text-textMuted">
              Numbered or Q1-style prompts, options as A) B) or A. or bullets, and an Answer /
              Correct line. Separate questions with a blank line.
            </p>
          </details>

          <AdminTextarea
            rows={10}
            placeholder="Paste your questions here…"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setPreview(null);
            }}
          />

          {preview ? (
            <div
              className={`rounded border px-4 py-3 font-mono text-xs uppercase tracking-wider ${
                preview.ok
                  ? "border-brand/20 bg-brand/5 text-brand"
                  : "border-rose-500/20 bg-rose-500/5 text-rose-400"
              }`}
            >
              {preview.ok ? (
                <p>
                  Found <strong>{preview.questions.length}</strong> question
                  {preview.questions.length === 1 ? "" : "s"} ready to import.
                </p>
              ) : (
                <p>{preview.error}</p>
              )}
              {preview.ok && preview.warnings.length > 0 ? (
                <ul className="mt-2 list-inside list-disc text-[10px] text-amber-400">
                  {preview.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 font-mono">
            <AdminButton variant="secondary" size="sm" onClick={handlePreview} disabled={!text.trim()}>
              Preview Parse
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => handleImport("append")}
              disabled={!text.trim()}
            >
              Append to Builder
            </AdminButton>
            <AdminButton size="sm" onClick={() => handleImport("replace")} disabled={!text.trim()}>
              Replace All Questions
            </AdminButton>
          </div>
        </div>
      ) : null}
    </AdminCard>
  );
}
