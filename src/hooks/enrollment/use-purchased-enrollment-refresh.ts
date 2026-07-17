"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * After checkout on the main Planitt site, users return with ?purchased=1.
 * Invalidate enrollment so paid courses unlock without a hard refresh.
 */
export function usePurchasedEnrollmentRefresh() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    if (searchParams.get("purchased") !== "1") return;

    handled.current = true;
    void queryClient.invalidateQueries({ queryKey: ["enrollment"] });

    const next = new URLSearchParams(searchParams.toString());
    next.delete("purchased");
    const qs = next.toString();
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  }, [searchParams, queryClient, router]);
}
