"use client";

import { useQuery } from "@tanstack/react-query";

import { withApiCredentials } from "@/lib/security/client-auth";
import type { AnalyticsOverview } from "@/types/admin.types";

type AnalyticsResponse = { ok: true; analytics: AnalyticsOverview };

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admin/analytics", withApiCredentials());
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = (await res.json()) as AnalyticsResponse;
      return data.analytics;
    },
  });
}
