"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect, useRef, useState } from "react";

import { useAuth } from "@/context/auth-context";

type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number },
          ) => void;
        };
      };
    };
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGoogleIdToken, loginAsDevUser, authReady, isAuthenticated, devStandalone } =
    useAuth();
  const buttonHostRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = searchParams.get("next");
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";

  useEffect(() => {
    if (authReady && isAuthenticated) {
      router.replace(safeNext);
    }
  }, [authReady, isAuthenticated, router, safeNext]);

  useEffect(() => {
    if (devStandalone) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!scriptReady || !clientId || !buttonHostRef.current || !window.google) return;
    buttonHostRef.current.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        const token = response.credential;
        if (!token) return;
        setSubmitting(true);
        setError("");
        void loginWithGoogleIdToken(token)
          .then(() => router.replace(safeNext))
          .catch(() => setError("Sign-in failed. Try again."))
          .finally(() => setSubmitting(false));
      },
    });
    window.google.accounts.id.renderButton(buttonHostRef.current, {
      theme: "filled_black",
      size: "large",
      width: 320,
    });
  }, [devStandalone, loginWithGoogleIdToken, router, safeNext, scriptReady]);

  const clientConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID);

  const handleDevLogin = () => {
    setSubmitting(true);
    setError("");
    void loginAsDevUser()
      .then(() => router.replace(safeNext))
      .catch(() => setError("Dev sign-in failed. Check LEARN_DEV_STANDALONE in .env.local."))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      {!devStandalone ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
        />
      ) : null}
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <h1 className="text-2xl font-bold">Sign in to Planitt Learn</h1>

        {devStandalone ? (
          <>
            <p className="mt-2 text-sm text-textSecondary">
              Local development mode — no Planitt appbackend required. Sign in with
              the mock user below to work on all portal features locally.
            </p>
            <button
              type="button"
              onClick={handleDevLogin}
              disabled={submitting}
              className="mt-6 w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
            >
              {submitting ? "Signing in…" : "Continue as dev user"}
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-textSecondary">
              Use the same Google account you use on Planitt. Course purchases are linked via payment
              history.
            </p>
            {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
            <div className="mt-6 min-h-[44px]" ref={buttonHostRef} />
            {!clientConfigured ? (
              <p className="mt-4 text-sm text-amber-400">
                Missing NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID. Create{" "}
                <code className="text-brand">.env.local</code>, then restart the dev server.
              </p>
            ) : null}
            {clientConfigured && scriptReady && !buttonHostRef.current?.hasChildNodes() ? (
              <p className="mt-4 text-sm text-textMuted">Loading Google sign-in…</p>
            ) : null}
            {submitting ? <p className="mt-2 text-sm text-textMuted">Signing in…</p> : null}
          </>
        )}

        {devStandalone && error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        <Link href="/" className="mt-8 text-sm text-textMuted hover:text-brand">
          ← Back
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-textSecondary">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
