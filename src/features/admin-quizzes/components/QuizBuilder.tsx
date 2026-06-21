"use client";

import { useState } from "react";

import type { QuizQuestion } from "@/types/quiz.types";

function newQuestion(): QuizQuestion {
  const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return { id, prompt: "", options: ["", ""], correctIndex: 0 };
}

export function QuizBuilder({
  initial,
  passingScore: initialPassing,
  title: initialTitle,
  onSave,
  saving,
}: {
  initial: QuizQuestion[];
  passingScore: number;
  title?: string;
  onSave: (payload: { title?: string; passingScore: number; questions: QuizQuestion[]; published: boolean }) => void;
  saving?: boolean;
}) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [passingScore, setPassingScore] = useState(initialPassing);
  const [questions, setQuestions] = useState<QuizQuestion[]>(initial.length ? initial : [newQuestion()]);
  const [published, setPublished] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-textSecondary">Title</span>
          <input
            className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-textSecondary">Passing score (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
          />
        </label>
      </div>

      {questions.map((question, qIndex) => (
        <div key={question.id} className="rounded-xl border border-borderSubtle bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">Question {qIndex + 1}</p>
            <button
              type="button"
              className="text-sm text-danger"
              onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qIndex))}
            >
              Remove
            </button>
          </div>
          <textarea
            className="mt-2 w-full rounded-lg border border-borderSubtle bg-background px-3 py-2 text-sm"
            rows={2}
            value={question.prompt}
            onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
            placeholder="Question prompt"
          />
          <div className="mt-3 space-y-2">
            {question.options.map((option, oIndex) => (
              <label key={oIndex} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctIndex === oIndex}
                  onChange={() => updateQuestion(qIndex, { correctIndex: oIndex })}
                />
                <input
                  className="flex-1 rounded-lg border border-borderSubtle bg-background px-3 py-2"
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Option ${oIndex + 1}`}
                />
              </label>
            ))}
            <button
              type="button"
              className="text-sm text-brand"
              onClick={() =>
                updateQuestion(qIndex, { options: [...question.options, ""] })
              }
            >
              + Add option
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-borderSubtle px-4 py-2 text-sm"
          onClick={() => setQuestions((prev) => [...prev, newQuestion()])}
        >
          Add question
        </button>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
        <button
          type="button"
          disabled={saving}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={() => onSave({ title, passingScore, questions, published })}
        >
          {saving ? "Saving…" : "Save assessment"}
        </button>
      </div>
    </div>
  );
}
