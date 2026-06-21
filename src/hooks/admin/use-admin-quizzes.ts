"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { withApiCredentials } from "@/lib/security/client-auth";
import type { QuizQuestion } from "@/types/quiz.types";

export type AdminQuiz = {
  id: string;
  title: string | null;
  passingScore: number;
  questions: QuizQuestion[];
  published: boolean;
  lessonId?: string;
  moduleId?: string;
};

export function useLessonQuiz(lessonId: string) {
  return useQuery({
    queryKey: ["admin", "quiz", "lesson", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/admin/quizzes/lessons/${lessonId}`, withApiCredentials());
      if (!res.ok) throw new Error("Failed to load quiz");
      const data = (await res.json()) as { ok: true; quiz: AdminQuiz | null };
      return data.quiz;
    },
    enabled: Boolean(lessonId),
  });
}

export function useSaveLessonQuiz(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/v1/admin/quizzes/lessons/${lessonId}`, withApiCredentials({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }));
      if (!res.ok) throw new Error("Failed to save quiz");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz", "lesson", lessonId] }),
  });
}

export function useModuleTest(moduleId: string) {
  return useQuery({
    queryKey: ["admin", "quiz", "module", moduleId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/admin/quizzes/modules/${moduleId}`, withApiCredentials());
      if (!res.ok) throw new Error("Failed to load module test");
      const data = (await res.json()) as { ok: true; test: AdminQuiz | null };
      return data.test;
    },
    enabled: Boolean(moduleId),
  });
}

export function useSaveModuleTest(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/v1/admin/quizzes/modules/${moduleId}`, withApiCredentials({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }));
      if (!res.ok) throw new Error("Failed to save module test");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "quiz", "module", moduleId] }),
  });
}
