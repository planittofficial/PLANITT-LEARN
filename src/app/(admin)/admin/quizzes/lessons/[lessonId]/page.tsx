"use client";

import Link from "next/link";
import { use } from "react";

import { QuizBuilder } from "@/features/admin-quizzes";
import { useLessonQuiz, useSaveLessonQuiz } from "@/hooks/admin/use-admin-quizzes";

export default function Page({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const { data: quiz, isLoading } = useLessonQuiz(lessonId);
  const saveQuiz = useSaveLessonQuiz(lessonId);

  if (isLoading) return <p>Loading quiz…</p>;

  return (
    <div className="space-y-6">
      <Link href={`/admin/lessons/${lessonId}`} className="text-sm text-brand">← Lesson</Link>
      <h1 className="text-2xl font-bold">Lesson quiz builder</h1>
      <QuizBuilder
        initial={quiz?.questions ?? []}
        passingScore={quiz?.passingScore ?? 60}
        title={quiz?.title ?? undefined}
        saving={saveQuiz.isPending}
        onSave={(payload) => saveQuiz.mutate(payload)}
      />
    </div>
  );
}
