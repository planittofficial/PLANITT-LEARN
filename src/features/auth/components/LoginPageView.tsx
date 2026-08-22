"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpen, LineChart, Loader2, Sparkles } from "lucide-react";

import { AlvestLogo } from "@/components/brand/AlvestLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ROUTES } from "@/constants/routes";
import { getLmsViewMode, setLmsViewMode } from "@/lib/auth/view-mode";
import { MAIN_WEBSITE_URL } from "@/constants/urls";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

type GoogleCredentialResponse = { credential?: string };

declare global {
  interface Window {
    google?: {
      accounts: { id: {
        initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
        renderButton: (parent: HTMLElement, options: { theme?: string; size?: string; width?: number; text?: string }) => void;
      } };
    };
  }
}

function resolvePostLoginPath(searchParams: URLSearchParams): string {
  const nextPath = searchParams.get("next");
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) return nextPath;
  const plan = searchParams.get("plan")?.trim().toLowerCase() ?? "";
  if (plan.startsWith("learn-")) return `${ROUTES.STUDENT.course(plan)}?purchased=1`;
  return ROUTES.STUDENT.HOME;
}

function postLoginPath(isAdmin: boolean, safeNext: string): string {
  if (!isAdmin) return safeNext;

  if (getLmsViewMode() === "student") {
    return safeNext;
  }

  if (safeNext === ROUTES.STUDENT.HOME) {
    setLmsViewMode("admin");
    return ROUTES.ADMIN.HOME;
  }

  return safeNext;
}

export function LoginPageView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithMpin, loginWithGoogleIdToken, exchangeHandoffCode, loginAsDevUser, authReady, isAuthenticated, isAdmin, devStandalone } = useAuth();
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
  const [focusedField, setFocusedField] = useState<"email" | "mpin" | null>(null);
  const safeNext = useMemo(() => resolvePostLoginPath(searchParams), [searchParams]);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const showGoogle = !devStandalone && Boolean(googleClientId);
  const mpinProgress = Math.min(mpin.length, 6);

  useEffect(() => { if (emailFromQuery) setEmail(emailFromQuery); }, [emailFromQuery]);

  useEffect(() => {
    if (authReady && isAuthenticated && !handoffPending) {
      router.replace(postLoginPath(isAdmin, safeNext));
    }
  }, [authReady, handoffPending, isAuthenticated, isAdmin, router, safeNext]);

  useEffect(() => {
    const code = searchParams.get("code")?.trim();
    if (!code || !authReady || handoffStarted.current) return;
    if (isAuthenticated) {
      setHandoffPending(false);
      router.replace(postLoginPath(isAdmin, safeNext));
      return;
    }
    handoffStarted.current = true;
    setHandoffPending(true);
    setSubmitting(true);
    setError("");
    void exchangeHandoffCode(code)
      .then((session) => {
        router.replace(postLoginPath(session.isAdmin, safeNext));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "SSO sign-in failed.");
        handoffStarted.current = false;
      })
      .finally(() => {
        setSubmitting(false);
        setHandoffPending(false);
      });
  }, [authReady, exchangeHandoffCode, isAuthenticated, isAdmin, router, safeNext, searchParams]);

  useEffect(() => {
    if (!showGoogle || !scriptReady || !googleClientId || !googleButtonRef.current || !window.google) return;
    googleButtonRef.current.innerHTML = "";
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: (response) => {
      const token = response.credential; if (!token) return;
      setSubmitting(true); setError("");
      void loginWithGoogleIdToken(token)
        .then((session) => {
          router.replace(postLoginPath(session.isAdmin, safeNext));
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Google sign-in failed. Try again."))
        .finally(() => setSubmitting(false));
    } });
    window.google.accounts.id.renderButton(googleButtonRef.current, { theme: mounted && theme === "light" ? "outline" : "filled_black", size: "large", width: 340, text: "continue_with" });
  }, [googleClientId, loginWithGoogleIdToken, mounted, router, safeNext, scriptReady, showGoogle, theme]);

  const handleMpinSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const session = await loginWithMpin(email.trim(), mpin.trim());
      router.replace(postLoginPath(session.isAdmin, safeNext));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevLogin = () => {
    setSubmitting(true);
    setError("");
    void loginAsDevUser()
      .then((session) => {
        router.replace(postLoginPath(session.isAdmin, safeNext));
      })
      .catch(() => setError("Dev sign-in failed."))
      .finally(() => setSubmitting(false));
  };

  return <>
    {showGoogle ? <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setScriptReady(true)} /> : null}
    <main className="relative min-h-screen overflow-hidden bg-appBase">
      <div className="login-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Link href={ROUTES.STUDENT.HOME} aria-label="Alvest Learn home" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50">
            <AlvestLogo variant="wordmark" size={52} priority className="drop-shadow-md" />
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href={ROUTES.STUDENT.HOME}
              className="text-textSecondary hover:text-brand text-xs uppercase tracking-wider font-semibold transition"
            >
              ← Back to website
            </Link>
            <ThemeToggle showLabel />
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:gap-20 lg:py-16">
          <section className="hidden max-w-xl lg:block">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-subtle px-3 py-1.5 text-xs font-medium text-brand"><BookOpen className="h-3.5 w-3.5" />Your learning workspace</div>
            <h1 className="max-w-lg font-headline text-5xl font-semibold leading-[1.06] tracking-[-0.04em] text-textPrimary xl:text-6xl">Learn with <span className="text-brand">clarity.</span></h1>
            <p className="mt-6 max-w-md text-base leading-7 text-textSecondary">Build a stronger market perspective with focused lessons, practical insights, and a learning path that moves at your pace.</p>
            <div className="relative mt-14 h-48 max-w-lg overflow-hidden rounded-2xl border border-borderSubtle bg-surface/70 p-5 shadow-card"><div className="absolute inset-0 trading-grid-bg opacity-70" /><div className="relative flex items-center justify-between text-xs text-textMuted"><span className="flex items-center gap-2"><LineChart className="h-4 w-4 text-brand" />A clearer way forward</span><span className="font-mono text-[10px]">ALVEST / LEARN</span></div><div className="login-chart absolute inset-x-5 bottom-5 h-24" aria-hidden="true" /></div>
          </section>

          <section className="w-full">
            <div className="login-card rounded-2xl border border-borderSubtle bg-surface p-6 shadow-theme sm:p-8">
              <div className="mb-8"><p className="mb-3 text-sm font-medium text-brand">Welcome back</p><h2 className="font-headline text-3xl font-semibold tracking-[-0.03em] text-textPrimary">Sign in to Alvest Learn</h2><p className="mt-2 text-sm leading-6 text-textSecondary">{handoffPending ? "Finishing your secure sign-in…" : "Continue your learning journey."}</p></div>
              <form onSubmit={handleMpinSubmit} onFocus={(event) => { if (event.target instanceof HTMLInputElement) setFocusedField(event.target.id === "login-mpin" ? "mpin" : "email"); }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusedField(null); }} className="space-y-5">
                <div className="login-interaction-hint"><span className="login-hint-icon"><Sparkles className="h-3.5 w-3.5" /></span><span>{focusedField ? `Focused on ${focusedField === "mpin" ? "your secure MPIN" : "your email"}` : "Your secure learning space is ready"}</span><span className="ml-auto font-mono text-[10px] text-textMuted">LIVE</span></div>
                <div><label htmlFor="login-email" className="mb-2 block text-sm font-medium text-textPrimary">Email address</label><input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 w-full rounded-lg border border-borderSubtle bg-elevated px-3.5 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-brand focus:ring-4 focus:ring-brand/10" /></div>
                <div><div className="mb-2 flex items-center justify-between"><label htmlFor="login-mpin" className="text-sm font-medium text-textPrimary">MPIN</label>{!devStandalone ? <a href={`${MAIN_WEBSITE_URL}/login`} className="rounded text-xs font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50">Forgot MPIN?</a> : null}</div><input id="login-mpin" type="password" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} pattern="\d{6}" value={mpin} onChange={(e) => setMpin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter your 6-digit MPIN" className="h-12 w-full rounded-lg border border-borderSubtle bg-elevated px-3.5 text-sm tracking-[0.35em] text-textPrimary outline-none transition placeholder:tracking-normal placeholder:text-textMuted focus:border-brand focus:ring-4 focus:ring-brand/10" /></div>
                {error ? <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm leading-5 text-red-500">{error}</p> : null}
                <button type="submit" disabled={submitting || mpin.length !== 6} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-brandForeground transition hover:bg-brandHover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> : <>Sign in <ArrowRight className="h-4 w-4" /></>}</button>
              </form>
              {showGoogle ? <div className="mt-7"><div className="mb-5 flex items-center gap-3"><div className="h-px flex-1 bg-borderSubtle" /><span className="text-xs text-textMuted">or continue with</span><div className="h-px flex-1 bg-borderSubtle" /></div><div ref={googleButtonRef} className="flex min-h-[44px] w-full justify-center overflow-hidden rounded-lg" />{!scriptReady ? <p className="mt-2 text-center text-xs text-textMuted">Loading Google sign-in…</p> : null}</div> : null}
              {devStandalone ? <div className="mt-7 border-t border-borderSubtle pt-5 text-center"><p className="text-xs text-textMuted">Development mode · MPIN <code className="text-brand">123456</code></p><button type="button" onClick={handleDevLogin} disabled={submitting} className="mt-3 text-xs font-medium text-textSecondary underline-offset-4 hover:text-brand hover:underline disabled:opacity-50">Use dev account</button></div> : null}
            </div>
            <p className="mt-6 text-center text-xs text-textMuted">By continuing, you’re returning to your Alvest learning workspace.</p>
          </section>
        </div>
      </div>
    </main>
  </>;
}
