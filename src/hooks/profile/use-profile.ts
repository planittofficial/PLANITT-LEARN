"use client";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { authedFetch } from "@/lib/security/client-auth";

type ProfileResponse = {
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

export function useProfile() {
  const { isAuthenticated, authReady } = useAuth();

  const query = useQuery({
    queryKey: ["profile", "me"],
    queryFn: fetchProfile,
    enabled: authReady && isAuthenticated,
    staleTime: 60_000,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
