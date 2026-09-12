"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminTextarea,
} from "@/features/admin-ui";
import type { QuizQuestion } from "@/types/quiz.types";

import { QuizSmartPaste } from "./QuizSmartPaste";

function newQuestion(): QuizQuestion {
  const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return { id, prompt: "", options: ["", ""], correctIndex: 0 };
}

function isEmptyQuestion(q: QuizQuestion) {
  return !q.prompt.trim() && q.options.every((opt) => !opt.trim());
}

function readyQuestions(list: QuizQuestion[]): QuizQuestion[] {
  return list.flatMap((q) => {
    const prompt = q.prompt.trim();
    const kept = q.options
      .map((opt, originalIndex) => ({ text: opt.trim(), originalIndex }))
      .filter((opt) => opt.text.length > 0);
    if (!prompt || kept.length < 2) return [];

    const mappedCorrect = kept.findIndex((opt) => opt.originalIndex === q.correctIndex);
    return [
      {
        id: q.id.trim() || `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        prompt,
        options: kept.map((opt) => opt.text),
        correctIndex: mappedCorrect >= 0 ? mappedCorrect : 0,
      },
    ];
  });
}

export function QuizBuilder({
  initial,
  passingScore: initialPassing,
  title: initialTitle,
  published: initialPublished = true,
  onSave,
  saving,
}: {
  initial: QuizQuestion[];
  passingScore: number;
  title?: string;
  published?: boolean;
  onSave: (payload: {
    title?: string;
    passingScore: number;
    questions: QuizQuestion[];
    published: boolean;
  }) => void | Promise<unknown>;
  saving?: boolean;
}) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [passingScore, setPassingScore] = useState(initialPassing);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initial.length ? initial : [newQuestion()],
  );
  const [published, setPublished] = useState(initialPublished);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  function updateQuestion(index: number, patch: Partial<QuizQuestion>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((opt, oi) => (oi === oIndex ? value : opt)) }
          : q,
      ),
    );
  }

  function handleSmartPaste(imported: QuizQuestion[], mode: "replace" | "append") {
    setSaveError("");
    setSaveOk(false);
    if (mode === "replace") {
      setQuestions(imported);
      return;
    }
    setQuestions((prev) => {
      const kept = prev.filter((q) => !isEmptyQuestion(q));
      return [...kept, ...imported];
    });
  }

  async function handleSave() {
    const questionsToSave = readyQuestions(questions);
    if (questionsToSave.length === 0) {
      setSaveOk(false);
      setSaveError("Add at least one question with a prompt and two options before saving.");
      return;
    }

    setSaveError("");
    setSaveOk(false);
    try {
      await onSave({
        title,
        passingScore,
        questions: questionsToSave,
        published,
      });
      setQuestions(questionsToSave);
      setSaveOk(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save assessment.");
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <QuizSmartPaste onImport={handleSmartPaste} />

      <AdminCard>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-textMuted">Assessment settings</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput label="Quiz Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <AdminInput
            label="Passing Score (%)"
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
          />
        </div>
      </AdminCard>

      {questions.map((question, qIndex) => (
        <AdminCard key={question.id}>
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-borderSubtle pb-2">
            <p className="text-sm font-semibold text-brand">Question {qIndex + 1}</p>
            <AdminButton
              variant="danger"
              size="sm"
              onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qIndex))}
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </AdminButton>
          </div>
          <AdminTextarea
            rows={2}
            placeholder="Enter the question prompt…"
            value={question.prompt}
            onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
          />
          <div className="mt-4 space-y-2.5">
            <p className="text-xs font-medium text-textMuted">Options (select the correct answer)</p>
            {question.options.map((option, oIndex) => (
              <label key={oIndex} className="flex items-center gap-3 text-sm text-textPrimary">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctIndex === oIndex}
                  onChange={() => updateQuestion(qIndex, { correctIndex: oIndex })}
                  className="h-4 w-4 accent-brand"
                />
                <input
                  className="flex-1 rounded-lg border border-borderSubtle bg-elevated px-3 py-2.5 text-sm text-textPrimary placeholder:text-textMuted outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                />
              </label>
            ))}
            <button
              type="button"
              className="text-xs font-semibold text-brand hover:underline"
              onClick={() =>
                updateQuestion(qIndex, { options: [...question.options, ""] })
              }
            >
              + Add option
            </button>
          </div>
        </AdminCard>
      ))}

      {saveError ? (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {saveError}
        </p>
      ) : null}
      {saveOk ? (
        <p className="rounded-lg border border-brand/20 bg-brand/10 px-3 py-2 text-sm text-brand">
          {published
            ? "Saved. Students can now take this assessment."
            : "Saved as a draft. Check “Publish to Students” and save again to make it visible."}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <AdminButton variant="secondary" onClick={() => setQuestions((prev) => [...prev, newQuestion()])}>
          <Plus className="h-3.5 w-3.5" />
          Add question
        </AdminButton>
        <label className="flex cursor-pointer items-center gap-2 text-textSecondary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-borderSubtle accent-brand"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publish to students
        </label>
        <AdminButton disabled={saving} onClick={() => void handleSave()}>
          {saving ? "Saving…" : "Save assessment"}
        </AdminButton>
      </div>
    </div>
  );
}
