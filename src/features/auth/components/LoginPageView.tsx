"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ROUTES } from "@/constants/routes";
import { MAIN_WEBSITE_URL } from "@/constants/urls";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

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
            options: { theme?: string; size?: string; width?: number; text?: string },
          ) => void;
        };
      };
    };
  }
}

function resolvePostLoginPath(searchParams: URLSearchParams): string {
  const nextPath = searchParams.get("next");
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    return nextPath;
  }

  const plan = searchParams.get("plan")?.trim().toLowerCase() ?? "";
  if (plan.startsWith("learn-")) {
    return `${ROUTES.STUDENT.course(plan)}?purchased=1`;
  }

  return ROUTES.STUDENT.HOME;
}

export function LoginPageView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    loginWithMpin,
    loginWithGoogleIdToken,
    exchangeHandoffCode,
    loginAsDevUser,
    authReady,
    isAuthenticated,
    devStandalone,
  } = useAuth();
  const { theme, mounted } = useTheme();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const handoffStarted = useRef(false);

  const emailFromQuery = searchParams.get("email")?.trim() ?? "";
  const [email, setEmail] = useState(emailFromQuery);
  const [mpin, setMpin] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [handoffPending, setHandoffPending] = useState(() => Boolean(searchParams.get("code")));

  const safeNext = useMemo(() => resolvePostLoginPath(searchParams), [searchParams]);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const showGoogle = !devStandalone && Boolean(googleClientId);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  useEffect(() => {
    if (authReady && isAuthenticated && !handoffPending) {
      router.replace(safeNext);
    }
  }, [authReady, handoffPending, isAuthenticated, router, safeNext]);

  useEffect(() => {
    const code = searchParams.get("code")?.trim();
    if (!code || !authReady || handoffStarted.current) return;
    if (isAuthenticated) {
      setHandoffPending(false);
      router.replace(safeNext);
      return;
    }

    handoffStarted.current = true;
    setHandoffPending(true);
    setSubmitting(true);
    setError("");
    void exchangeHandoffCode(code)
      .then(() => router.replace(safeNext))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "SSO sign-in failed.";
        setError(message);
        handoffStarted.current = false;
      })
      .finally(() => {
        setSubmitting(false);
        setHandoffPending(false);
      });
  }, [authReady, exchangeHandoffCode, isAuthenticated, router, safeNext, searchParams]);

  useEffect(() => {
    if (!showGoogle) return;
    if (!scriptReady || !googleClientId || !googleButtonRef.current || !window.google) return;

    googleButtonRef.current.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => {
        const token = response.credential;
        if (!token) return;
        setSubmitting(true);
        setError("");
        void loginWithGoogleIdToken(token)
          .then(() => router.replace(safeNext))
          .catch((err) => {
            const message =
              err instanceof Error ? err.message : "Google sign-in failed. Try again.";
            setError(message);
          })
          .finally(() => setSubmitting(false));
      },
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: mounted && theme === "light" ? "outline" : "filled_black",
      size: "large",
      width: 360,
      text: "continue_with",
    });
  }, [
    googleClientId,
    loginWithGoogleIdToken,
    mounted,
    router,
    safeNext,
    scriptReady,
    showGoogle,
    theme,
  ]);

  const handleMpinSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await loginWithMpin(email.trim(), mpin.trim());
      router.replace(safeNext);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevLogin = () => {
    setSubmitting(true);
    setError("");
    void loginAsDevUser()
      .then(() => router.replace(safeNext))
      .catch(() => setError("Dev sign-in failed."))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      {showGoogle ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
        />
      ) : null}

      <div className="relative flex min-h-screen flex-col items-center justify-center bg-appBase px-4 py-10">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brandForeground shadow-sm dark:text-black">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-textPrimary">
            Planitt<span className="text-brand"> Learn</span>
          </span>
        </div>

        <div className="w-full max-w-[400px] rounded-2xl border border-borderSubtle bg-surface p-6 shadow-theme sm:p-8">
          <h1 className="text-2xl font-bold text-textPrimary">Welcome back</h1>
          <p className="mt-2 text-sm text-textSecondary">
            {handoffPending
              ? "Signing you in from Planitt…"
              : devStandalone
                ? "Local dev mode — sign in with email + MPIN or use the quick dev button."
                : "Sign in with Google or your Planitt email and 6-digit MPIN."}
          </p>

          <form onSubmit={handleMpinSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="font-medium text-textSecondary">Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-xl border border-borderSubtle bg-background px-3.5 py-2.5 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-textSecondary">MPIN</span>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                pattern="\d{6}"
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit MPIN"
                className="mt-1.5 w-full rounded-xl border border-borderSubtle bg-background px-3.5 py-2.5 text-sm tracking-[0.35em] text-textPrimary outline-none transition placeholder:tracking-normal placeholder:text-textMuted focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
              />
            </label>

            {!devStandalone ? (
              <div className="flex justify-end">
                <a
                  href={`${MAIN_WEBSITE_URL}/login`}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Forgot MPIN?
                </a>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || mpin.length !== 6}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brandForeground transition hover:bg-brandHover disabled:opacity-60 dark:text-black dark:hover:brightness-110",
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {showGoogle ? (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-borderSubtle" />
                <span className="text-xs font-medium uppercase tracking-wider text-textMuted">
                  or
                </span>
                <div className="h-px flex-1 bg-borderSubtle" />
              </div>

              <div className="flex justify-center">
                <div ref={googleButtonRef} className="min-h-[44px]" />
              </div>

              {!scriptReady ? (
                <p className="mt-3 text-center text-xs text-textMuted">Loading Google sign-in…</p>
              ) : null}
            </>
          ) : null}

          {devStandalone ? (
            <div className="mt-6 border-t border-borderSubtle pt-5">
              <p className="text-center text-xs text-textMuted">
                Dev shortcut — default MPIN is <code className="text-brand">123456</code> unless{" "}
                <code className="text-brand">LEARN_DEV_MOCK_MPIN</code> is set.
              </p>
              <button
                type="button"
                onClick={handleDevLogin}
                disabled={submitting}
                className="mt-3 w-full rounded-xl border border-borderSubtle px-4 py-2.5 text-sm font-medium text-textSecondary transition hover:border-brand/30 hover:text-brand disabled:opacity-50"
              >
                Continue as dev user (no MPIN)
              </button>
            </div>
          ) : null}

          {!showGoogle && !devStandalone ? (
            <p className="mt-4 text-center text-xs text-amber-400">
              Google sign-in is not configured. Set{" "}
              <code className="text-brand">NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID</code> in{" "}
              <code className="text-brand">.env.local</code>.
            </p>
          ) : null}
        </div>

        <Link
          href={ROUTES.STUDENT.HOME}
          className="mt-8 text-sm text-textMuted transition hover:text-brand"
        >
          ← Back to home
        </Link>
      </div>
    </>
  );
}
