"use client";

import { withApiCredentials } from "@/lib/security/client-auth";
import type { PlatformOverview } from "@/types/admin.types";

type OverviewResponse = { ok: true; overview: PlatformOverview };

export async function fetchAdminOverview(): Promise<PlatformOverview> {
  const res = await fetch("/api/v1/admin/overview", withApiCredentials());
  if (!res.ok) throw new Error("Failed to load overview");
  const data = (await res.json()) as OverviewResponse;
  return data.overview;
}
