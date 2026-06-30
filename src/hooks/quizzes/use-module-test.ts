"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { withApiCredentials } from "@/lib/security/client-auth";
import type { QuizAnswer, QuizAttemptResult, QuizPublicView } from "@/types/quiz.types";

type TestResponse = { ok: true; test: QuizPublicView };
type AttemptResponse = { ok: true; result: QuizAttemptResult };

async function fetchModuleTest(moduleId: string): Promise<QuizPublicView | null> {
  const res = await fetch(ROUTES.API.QUIZZES.module(moduleId), withApiCredentials());
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as TestResponse;
  return data.test ?? null;
}

async function submitModuleTest(
  moduleId: string,
  answers: QuizAnswer[],
): Promise<QuizAttemptResult | null> {
  const res = await fetch(
    ROUTES.API.QUIZZES.moduleAttempts(moduleId),
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

export function useModuleTest(moduleId: string, enabled = true) {
  const queryClient = useQueryClient();

  const testQuery = useQuery({
    queryKey: ["quiz", "module", moduleId],
    queryFn: () => fetchModuleTest(moduleId),
    enabled: enabled && Boolean(moduleId),
    staleTime: 60_000,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (answers: QuizAnswer[]) => submitModuleTest(moduleId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  return {
    test: testQuery.data,
    hasTest: Boolean(testQuery.data),
    isLoading: testQuery.isLoading,
    submitTest: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    result: submitMutation.data,
    submitError: submitMutation.error,
    resetResult: submitMutation.reset,
  };
}

