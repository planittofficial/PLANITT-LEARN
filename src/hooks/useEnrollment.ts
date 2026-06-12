"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
import { enrolledCourseIdsFromTransactions, type PaymentTransaction } from "@/lib/learning/enrollment";
import { withApiCredentials } from "@/lib/security/client-auth";

type HistoryResponse = {
  items?: PaymentTransaction[];
};

async function fetchPaymentHistory(): Promise<PaymentTransaction[]> {
  const res = await fetch("/api/payments/me/history", withApiCredentials());
  if (!res.ok) return [];
  const data = (await res.json()) as HistoryResponse;
  return Array.isArray(data.items) ? data.items : [];
}

export function useEnrollment() {
  const { isAuthenticated, authReady } = useAuth();

  const query = useQuery({
    queryKey: ["enrollment", "payments"],
    queryFn: fetchPaymentHistory,
    enabled: authReady && isAuthenticated,
    staleTime: 60_000,
  });

  const enrolledIds = enrolledCourseIdsFromTransactions(query.data ?? []);

  return {
    authReady,
    isAuthenticated,
    loading: !authReady || (isAuthenticated && query.isLoading),
    enrolledIds,
    refetch: query.refetch,
  };
}
