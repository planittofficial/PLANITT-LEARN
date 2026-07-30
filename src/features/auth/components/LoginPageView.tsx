"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, TrendingUp, Cpu, KeyRound } from "lucide-react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BRAND } from "@/constants/brand";
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
    isAdmin,
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
      if (isAdmin && safeNext === ROUTES.STUDENT.HOME) {
        router.replace(ROUTES.ADMIN.HOME);
      } else {
        router.replace(safeNext);
      }
    }
  }, [authReady, handoffPending, isAuthenticated, isAdmin, router, safeNext]);

  useEffect(() => {
    const code = searchParams.get("code")?.trim();
    if (!code || !authReady || handoffStarted.current) return;
    if (isAuthenticated) {
      setHandoffPending(false);
      if (isAdmin && safeNext === ROUTES.STUDENT.HOME) {
        router.replace(ROUTES.ADMIN.HOME);
      } else {
        router.replace(safeNext);
      }
      return;
    }

    handoffStarted.current = true;
    setHandoffPending(true);
    setSubmitting(true);
    setError("");
    void exchangeHandoffCode(code)
      .then(() => {
        if (isAdmin && safeNext === ROUTES.STUDENT.HOME) {
          router.replace(ROUTES.ADMIN.HOME);
        } else {
          router.replace(safeNext);
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "SSO sign-in failed.";
        setError(message);
        handoffStarted.current = false;
      })
      .finally(() => {
        setSubmitting(false);
        setHandoffPending(false);
      });
  }, [authReady, exchangeHandoffCode, isAuthenticated, isAdmin, router, safeNext, searchParams]);

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
      width: 340,
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

      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-4 py-10 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 radar-grid opacity-20 pointer-events-none" />

        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>

        {/* Brand Logo Header */}
        <div className="mb-8 flex flex-col items-center gap-3 z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 border border-brand/20">
            <TrendingUp className="h-6 w-6 text-brand" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">
            SECURE_TERMINAL_INTERFACE
          </p>
        </div>

        {/* Glassmorphic Login Box */}
        <div className="w-full max-w-[380px] rounded-lg border border-borderSubtle bg-surface/60 backdrop-blur-md p-6 shadow-2xl relative z-10 space-y-6">
          <div className="flex justify-between items-center border-b border-borderSubtle pb-4">
            <div>
              <h1 className="font-headline text-lg font-bold text-textPrimary uppercase tracking-tight">
                Enter Terminal
              </h1>
              <p className="text-[10px] font-mono text-textMuted uppercase mt-1">
                {handoffPending ? "SSO_AUTHORIZATION_PENDING" : "AUTHENTICATION_REQUIRED"}
              </p>
            </div>
            <Cpu className="h-5 w-5 text-brand animate-pulse-live" />
          </div>

          <form onSubmit={handleMpinSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-textSecondary uppercase tracking-widest mb-1.5">
                USER_EMAIL
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded bg-elevated border border-borderSubtle px-3.5 py-2.5 font-mono text-xs text-textPrimary placeholder:text-textMuted focus:border-brand focus:ring-1 focus:ring-brand/30 outline-none transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-mono text-textSecondary uppercase tracking-widest">
                  ACCESS_MPIN
                </label>
                {!devStandalone ? (
                  <a
                    href={`${MAIN_WEBSITE_URL}/login`}
                    className="text-[9px] font-mono text-brand hover:underline uppercase tracking-wider"
                  >
                    Forgot?
                  </a>
                ) : null}
              </div>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                pattern="\d{6}"
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-DIGIT MPIN"
                className="w-full rounded bg-elevated border border-borderSubtle px-3.5 py-2.5 font-mono text-xs text-textPrimary tracking-[0.4em] placeholder:tracking-normal placeholder:text-textMuted focus:border-brand focus:ring-1 focus:ring-brand/30 outline-none transition"
              />
            </div>

            {error ? (
              <p className="rounded border border-red-500/20 bg-red-500/10 px-3 py-2 font-mono text-[10px] text-red-400">
                &gt; ERROR: {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || mpin.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded bg-brand px-4 py-3 font-mono text-xs font-bold text-black uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(20,184,166,0.15)]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  AUTHORIZING…
                </>
              ) : (
                "CONNECT TERMINAL"
              )}
            </button>
          </form>

          {showGoogle ? (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-textMuted">
                  sso_alternate
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="flex justify-center">
                <div ref={googleButtonRef} className="min-h-[44px]" />
              </div>

              {!scriptReady ? (
                <p className="text-center font-mono text-[9px] text-textMuted uppercase tracking-widest">
                  Loading SSO Client…
                </p>
              ) : null}
            </>
          ) : null}

          {devStandalone ? (
            <div className="border-t border-white/5 pt-4 space-y-3">
              <p className="text-center font-mono text-[9px] text-textMuted leading-relaxed">
                DEV_MODE: Default MPIN is <code className="text-brand">123456</code>.
              </p>
              <button
                type="button"
                onClick={handleDevLogin}
                disabled={submitting}
                className="w-full rounded border border-white/5 px-4 py-2.5 font-mono text-[10px] text-textSecondary uppercase tracking-widest hover:border-brand/40 hover:text-brand disabled:opacity-50 transition"
              >
                BYPASS AUTH (DEV USER)
              </button>
            </div>
          ) : null}
        </div>

        <Link
          href={ROUTES.STUDENT.HOME}
          className="mt-8 font-mono text-xs text-textMuted hover:text-brand transition uppercase tracking-wider"
        >
          ← Back to home
        </Link>
      </div>
    </>
  );
}
