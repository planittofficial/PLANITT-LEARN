"use client";

import Link from "next/link";
import { use } from "react";
import { Target } from "lucide-react";

import { AdminPageHeader, AdminPageSkeleton } from "@/features/admin-ui";
import { QuizBuilder } from "@/features/admin-quizzes";
import { useLessonQuiz, useSaveLessonQuiz } from "@/hooks/admin/use-admin-quizzes";

export default function Page({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const { data: quiz, isLoading } = useLessonQuiz(lessonId);
  const saveQuiz = useSaveLessonQuiz(lessonId);

  if (isLoading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <Link
        href={`/admin/lessons/${lessonId}`}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] text-brand hover:underline uppercase tracking-widest"
      >
        ← Back to Lesson Node
      </Link>
      <AdminPageHeader
        eyebrow="Assessment Setup"
        title="Lesson Quiz Builder"
        description="Create multiple-choice questions and set a passing score for this lesson."
        icon={Target}
      />
      <QuizBuilder
        initial={quiz?.questions ?? []}
        passingScore={quiz?.passingScore ?? 60}
        title={quiz?.title ?? undefined}
        published={quiz?.published ?? false}
        saving={saveQuiz.isPending}
        onSave={(payload) => saveQuiz.mutate(payload)}
      />
    </div>
  );
}
