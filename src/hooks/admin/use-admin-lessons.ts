"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authedFetch } from "@/lib/security/client-auth";
import type { LessonKind } from "@/types/course.types";

export type AdminLessonRow = {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  summary: string;
  kind: LessonKind;
  sortOrder: number;
  durationMinutes: number;
  durationSeconds: number | null;
  minWatchPercent: number;
  videoKey: string | null;
  videoUrl: string | null;
  markdown: string | null;
  externalUrl: string | null;
  published: boolean;
};

export function useAdminLessons(moduleId: string) {
  return useQuery({
    queryKey: ["admin", "lessons", moduleId],
    queryFn: async () => {
      const res = await authedFetch(`/api/v1/admin/lessons?moduleId=${moduleId}`);
      if (!res.ok) throw new Error("Failed to load lessons");
      const data = (await res.json()) as { ok: true; lessons: AdminLessonRow[] };
      return data.lessons;
    },
    enabled: Boolean(moduleId),
  });
}

export function useAdminLesson(lessonId: string) {
  return useQuery({
    queryKey: ["admin", "lesson", lessonId],
    queryFn: async () => {
      const res = await authedFetch(`/api/v1/admin/lessons/${lessonId}`);
      if (!res.ok) throw new Error("Failed to load lesson");
      const data = (await res.json()) as { ok: true; lesson: AdminLessonRow };
      return data.lesson;
    },
    enabled: Boolean(lessonId),
  });
}

export function useCreateLesson(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await authedFetch("/api/v1/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, moduleId }),
      });
      if (!res.ok) throw new Error("Failed to create lesson");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "lessons", moduleId] }),
  });
}

export function useUpdateLesson(lessonId: string, moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await authedFetch(`/api/v1/admin/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update lesson");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "lessons", moduleId] });
      qc.invalidateQueries({ queryKey: ["admin", "lesson", lessonId] });
    },
  });
}

export function useDeleteLesson(moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const res = await authedFetch(`/api/v1/admin/lessons/${lessonId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete lesson");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "lessons", moduleId] }),
  });
}

export function usePresignUpload() {
  return useMutation({
    mutationFn: async (body: { filename: string; contentType?: string; lessonId?: string }) => {
      const res = await authedFetch("/api/v1/admin/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const data = (await res.json()) as {
        ok: true;
        presign: { uploadUrl: string; videoKey: string; publicUrl: string };
      };
      return data.presign;
    },
  });
}
