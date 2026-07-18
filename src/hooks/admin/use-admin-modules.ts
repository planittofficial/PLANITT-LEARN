"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authedFetch } from "@/lib/security/client-auth";

export type AdminModuleRow = {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  sortOrder: number;
  published: boolean;
  lessonCount: number;
};

export function useAdminModules(courseId: string) {
  return useQuery({
    queryKey: ["admin", "modules", courseId],
    queryFn: async () => {
      const res = await authedFetch(`/api/v1/admin/modules?courseId=${courseId}`);
      if (!res.ok) throw new Error("Failed to load modules");
      const data = (await res.json()) as { ok: true; modules: AdminModuleRow[] };
      return data.modules;
    },
    enabled: Boolean(courseId),
  });
}

export function useCreateModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await authedFetch("/api/v1/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, courseId }),
      });
      if (!res.ok) throw new Error("Failed to create module");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "modules", courseId] }),
  });
}

export function useUpdateModule(moduleId: string, courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await authedFetch(`/api/v1/admin/modules/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update module");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "modules", courseId] }),
  });
}

export function useDeleteModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (moduleId: string) => {
      const res = await authedFetch(`/api/v1/admin/modules/${moduleId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete module");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "modules", courseId] }),
  });
}
