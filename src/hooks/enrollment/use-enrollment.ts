"use client";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import {
  enrolledCourseIdsFromTransactions,
  type PaymentTransaction,
} from "@/lib/learning/enrollment";
import { withApiCredentials } from "@/lib/security/client-auth";

type HistoryResponse = {
  items?: PaymentTransaction[];
};

type DevPreviewResponse = {
  enrolledCourseIds?: string[];
};

async function fetchEnrollment(): Promise<PaymentTransaction[]> {
  const res = await fetch(ROUTES.API.ENROLLMENT.ME, withApiCredentials());
  if (!res.ok) return [];
  const data = (await res.json()) as HistoryResponse;
  return Array.isArray(data.items) ? data.items : [];
}

async function fetchDevPreview(): Promise<Set<string>> {
  const res = await fetch(ROUTES.API.ENROLLMENT.PREVIEW);
  if (!res.ok) return new Set();
  const data = (await res.json()) as DevPreviewResponse;
  return new Set(Array.isArray(data.enrolledCourseIds) ? data.enrolledCourseIds : []);
}

const DEV_STANDALONE =
  process.env.NEXT_PUBLIC_LEARN_DEV_STANDALONE?.trim().toLowerCase() === "true";

export function useEnrollment() {
  const { isAuthenticated, authReady, devStandalone } = useAuth();

  const paymentQuery = useQuery({
    queryKey: ["enrollment", "me"],
    queryFn: fetchEnrollment,
    enabled: authReady && isAuthenticated,
    staleTime: 60_000,
  });

  const previewQuery = useQuery({
    queryKey: ["enrollment", "preview"],
    queryFn: fetchDevPreview,
    enabled: authReady && !isAuthenticated && (devStandalone || DEV_STANDALONE),
    staleTime: 60_000,
  });

  const enrolledIds = isAuthenticated
    ? enrolledCourseIdsFromTransactions(paymentQuery.data ?? [])
    : previewQuery.data ?? new Set<string>();

  const loading =
    !authReady ||
    (isAuthenticated && paymentQuery.isLoading) ||
    (!isAuthenticated && (devStandalone || DEV_STANDALONE) && previewQuery.isLoading);

  return {
    authReady,
    isAuthenticated,
    devPreview: !isAuthenticated && (devStandalone || DEV_STANDALONE),
    loading,
    enrolledIds,
    refetch: isAuthenticated ? paymentQuery.refetch : previewQuery.refetch,
  };
}
