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
    <div className="space-y-8">
      <Link href={`/admin/lessons/${lessonId}`} className="text-sm text-violet-400 hover:underline">
        ← Lesson
      </Link>
      <AdminPageHeader
        eyebrow="Assessment"
        title="Lesson quiz builder"
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
