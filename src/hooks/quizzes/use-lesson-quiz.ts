"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { withApiCredentials } from "@/lib/security/client-auth";
import type { QuizAnswer, QuizAttemptResult, QuizPublicView } from "@/types/quiz.types";

type QuizResponse = { ok: true; quiz: QuizPublicView };
type AttemptResponse = { ok: true; result: QuizAttemptResult };

async function fetchLessonQuiz(lessonId: string): Promise<QuizPublicView | null> {
  const res = await fetch(ROUTES.API.QUIZZES.lesson(lessonId), withApiCredentials());
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as QuizResponse;
  return data.quiz ?? null;
}

async function submitLessonQuiz(
  lessonId: string,
  answers: QuizAnswer[],
): Promise<QuizAttemptResult | null> {
  const res = await fetch(
    ROUTES.API.QUIZZES.lessonAttempts(lessonId),
    withApiCredentials({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    }),
  );
  if (!res.ok) return null;
  const data = (await res.json()) as AttemptResponse;
  return data.result ?? null;
}

/** Fetch and submit a lesson quiz from the student API. */
export function useLessonQuiz(lessonId: string, enabled = true) {
  const queryClient = useQueryClient();

  const quizQuery = useQuery({
    queryKey: ["quiz", "lesson", lessonId],
    queryFn: () => fetchLessonQuiz(lessonId),
    enabled: enabled && Boolean(lessonId),
    staleTime: 60_000,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (answers: QuizAnswer[]) => submitLessonQuiz(lessonId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  return {
    quiz: quizQuery.data,
    hasQuiz: Boolean(quizQuery.data),
    isLoading: quizQuery.isLoading,
    submitQuiz: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    result: submitMutation.data,
    submitError: submitMutation.error,
    resetResult: submitMutation.reset,
  };
}

/** @deprecated Use useLessonQuiz */
export function useQuizAttempt() {
  return useLessonQuiz("");
}
