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

export function QuizBuilder({
  initial,
  passingScore: initialPassing,
  title: initialTitle,
  published: initialPublished = false,
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
  }) => void;
  saving?: boolean;
}) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [passingScore, setPassingScore] = useState(initialPassing);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initial.length ? initial : [newQuestion()],
  );
  const [published, setPublished] = useState(initialPublished);

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

  function isEmptyQuestion(q: QuizQuestion) {
    return !q.prompt.trim() && q.options.every((opt) => !opt.trim());
  }

  function handleSmartPaste(imported: QuizQuestion[], mode: "replace" | "append") {
    if (mode === "replace") {
      setQuestions(imported);
      return;
    }
    setQuestions((prev) => {
      const kept = prev.filter((q) => !isEmptyQuestion(q));
      return [...kept, ...imported];
    });
  }

  return (
    <div className="space-y-6">
      <QuizSmartPaste onImport={handleSmartPaste} />

      <AdminCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <AdminInput
            label="Passing score (%)"
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
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="font-semibold text-violet-300">Question {qIndex + 1}</p>
            <AdminButton
              variant="danger"
              size="sm"
              onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qIndex))}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </AdminButton>
          </div>
          <AdminTextarea
            rows={2}
            placeholder="Question prompt"
            value={question.prompt}
            onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
          />
          <div className="mt-4 space-y-2">
            {question.options.map((option, oIndex) => (
              <label key={oIndex} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctIndex === oIndex}
                  onChange={() => updateQuestion(qIndex, { correctIndex: oIndex })}
                  className="accent-violet-500"
                />
                <input
                  className="flex-1 rounded-xl border border-borderSubtle bg-overlay-subtle px-3 py-2 outline-none focus:border-violet-500/40"
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Option ${oIndex + 1}`}
                />
              </label>
            ))}
            <button
              type="button"
              className="text-sm text-violet-400 hover:underline"
              onClick={() =>
                updateQuestion(qIndex, { options: [...question.options, ""] })
              }
            >
              + Add option
            </button>
          </div>
        </AdminCard>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <AdminButton variant="secondary" onClick={() => setQuestions((prev) => [...prev, newQuestion()])}>
          <Plus className="h-4 w-4" />
          Add question
        </AdminButton>
        <label className="flex items-center gap-2 text-sm text-textSecondary">
          <input
            type="checkbox"
            className="rounded border-borderSubtle accent-violet-500"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
        <AdminButton
          disabled={saving}
          onClick={() => onSave({ title, passingScore, questions, published })}
        >
          {saving ? "Saving…" : "Save assessment"}
        </AdminButton>
      </div>
    </div>
  );
}
