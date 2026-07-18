"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authedFetch } from "@/lib/security/client-auth";
import type { ApiAdminCourse } from "@/types/course.types";

type CoursesResponse = { ok: true; courses: ApiAdminCourse[] };
type CourseResponse = { ok: true; course: ApiAdminCourse & { description?: string; thumbnailUrl?: string | null } };

export async function fetchAdminCourses(): Promise<ApiAdminCourse[]> {
  const res = await authedFetch("/api/v1/admin/courses");
  if (!res.ok) throw new Error("Failed to load courses");
  const data = (await res.json()) as CoursesResponse;
  return data.courses;
}

export async function fetchAdminCourse(courseId: string) {
  const res = await authedFetch(`/api/v1/admin/courses/${courseId}`);
  if (!res.ok) throw new Error("Failed to load course");
  const data = (await res.json()) as CourseResponse;
  return data.course;
}

export function useAdminCourses() {
  return useQuery({
    queryKey: ["admin", "courses"],
    queryFn: fetchAdminCourses,
  });
}

export function useAdminCourse(courseId: string) {
  return useQuery({
    queryKey: ["admin", "courses", courseId],
    queryFn: () => fetchAdminCourse(courseId),
    enabled: Boolean(courseId),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await authedFetch("/api/v1/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json()) as { detail?: string };
        throw new Error(err.detail ?? "Failed to create course");
      }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}

export function useUpdateCourse(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await authedFetch(`/api/v1/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json()) as { detail?: string };
        throw new Error(err.detail ?? "Failed to update course");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "courses"] });
      qc.invalidateQueries({ queryKey: ["admin", "courses", courseId] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await authedFetch(`/api/v1/admin/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "courses"] }),
  });
}
