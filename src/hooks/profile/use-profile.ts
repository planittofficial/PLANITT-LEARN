"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { authedFetch } from "@/lib/security/client-auth";

export type ProfileResponse = {
  ok: true;
  user: { id: string; email: string; name: string };
  stats: {
    enrolledCourseCount: number;
    lessonsCompleted: number;
    totalLessons: number;
  };
  enrolledCourseIds: string[];
};

async function fetchProfile(): Promise<ProfileResponse | null> {
  const res = await authedFetch(ROUTES.API.PROFILE.ME);
  if (!res.ok) return null;
  return (await res.json()) as ProfileResponse;
}

async function patchProfile(body: { name: string }): Promise<ProfileResponse> {
  const res = await authedFetch(ROUTES.API.PROFILE.ME, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as
    | ProfileResponse
    | { ok: false; detail?: string }
    | null;
  if (!res.ok || !data || !("user" in data)) {
    throw new Error(
      data && "detail" in data && data.detail ? data.detail : "Could not update profile",
    );
  }
  return data;
}

export function useProfile() {
  const { isAuthenticated, authReady, updateLocalUser } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchProfile,
    enabled: authReady && isAuthenticated,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: patchProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "me"], data);
      updateLocalUser({ name: data.user.name });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    updateName: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error instanceof Error ? mutation.error.message : null,
  };
}
