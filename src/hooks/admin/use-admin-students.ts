"use client";

import { useQuery } from "@tanstack/react-query";

import { withApiCredentials } from "@/lib/security/client-auth";
import type { AdminStudentDetail, AdminStudentSummary } from "@/types/admin.types";

type StudentsResponse = {
  ok: true;
  items: AdminStudentSummary[];
  total: number;
  page: number;
  pageSize: number;
};

type StudentResponse = { ok: true; student: AdminStudentDetail };

export function useAdminStudents(params: { page?: number; pageSize?: number; q?: string }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const q = params.q ?? "";

  return useQuery({
    queryKey: ["admin", "students", page, pageSize, q],
    queryFn: async () => {
      const search = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (q) search.set("q", q);
      const res = await fetch(`/api/v1/admin/students?${search}`, withApiCredentials());
      if (!res.ok) throw new Error("Failed to load students");
      return (await res.json()) as StudentsResponse;
    },
  });
}

export function useAdminStudent(userId: string) {
  return useQuery({
    queryKey: ["admin", "students", userId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/admin/students/${userId}`, withApiCredentials());
      if (!res.ok) throw new Error("Failed to load student");
      const data = (await res.json()) as StudentResponse;
      return data.student;
    },
    enabled: Boolean(userId),
  });
}
