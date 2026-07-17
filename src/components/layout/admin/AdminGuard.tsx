"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { authedFetch } from "@/lib/security/client-auth";

type AdminGuardProps = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await authedFetch(ROUTES.API.AUTH.ADMIN);
        if (!res.ok) {
          if (!cancelled) setStatus("denied");
          return;
        }
        const data = (await res.json()) as { isAdmin?: boolean };
        if (!cancelled) {
          setStatus(data.isAdmin ? "allowed" : "denied");
        }
      } catch {
        if (!cancelled) setStatus("denied");
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === "denied") {
      router.replace(ROUTES.STUDENT.HOME);
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-appBase">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-appBase px-6 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-400" />
        <p className="text-sm text-textSecondary">Admin access required. Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}
