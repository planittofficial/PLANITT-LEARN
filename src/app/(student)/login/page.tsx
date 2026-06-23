"use client";

import { Suspense } from "react";

import { LoginPageView } from "@/features/auth/components/LoginPageView";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-textSecondary">
          Loading…
        </div>
      }
    >
      <LoginPageView />
    </Suspense>
  );
}
