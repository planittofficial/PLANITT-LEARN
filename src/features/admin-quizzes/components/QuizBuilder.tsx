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
    <div className="space-y-6 animate-in fade-in">
      <QuizSmartPaste onImport={handleSmartPaste} />

      <AdminCard>
        <p className="font-mono text-[9px] text-textMuted uppercase tracking-widest mb-3">Quiz_Assessment_Properties</p>
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
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/5 pb-2">
            <p className="font-mono text-xs font-bold text-brand uppercase tracking-wider">Question #{qIndex + 1}</p>
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
            placeholder="ENTER QUESTION PROMPT / STEM..."
            value={question.prompt}
            onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
          />
          <div className="mt-4 space-y-2.5">
            <p className="font-mono text-[9px] text-textMuted uppercase tracking-widest">Options / Distractors (Select correct answer)</p>
            {question.options.map((option, oIndex) => (
              <label key={oIndex} className="flex items-center gap-3 font-mono text-xs text-textPrimary">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctIndex === oIndex}
                  onChange={() => updateQuestion(qIndex, { correctIndex: oIndex })}
                  className="accent-brand h-4 w-4 border-white/10 bg-[#1C1B1B]"
                />
                <input
                  className="flex-1 rounded border border-white/5 bg-[#1C1B1B] px-3 py-2.5 font-mono text-xs text-textPrimary placeholder:text-textMuted outline-none focus:border-brand/40 tracking-wide uppercase"
                  value={option}
                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                />
              </label>
            ))}
            <button
              type="button"
              className="font-mono text-[10px] text-brand hover:underline uppercase tracking-wider font-bold"
              onClick={() =>
                updateQuestion(qIndex, { options: [...question.options, ""] })
              }
            >
              + Add Option Row
            </button>
          </div>
        </AdminCard>
      ))}

      <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
        <AdminButton variant="secondary" onClick={() => setQuestions((prev) => [...prev, newQuestion()])}>
          <Plus className="h-3.5 w-3.5" />
          Add Question Node
        </AdminButton>
        <label className="flex items-center gap-2 text-textSecondary cursor-pointer uppercase tracking-widest text-[10px]">
          <input
            type="checkbox"
            className="rounded border-white/10 accent-brand h-4 w-4 bg-[#1C1B1B]"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publish to Students
        </label>
        <AdminButton
          disabled={saving}
          onClick={() => onSave({ title, passingScore, questions, published })}
        >
          {saving ? "Commiting..." : "Commit Assessment Setup"}
        </AdminButton>
      </div>
    </div>
  );
}
