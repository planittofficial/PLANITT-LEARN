"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { withApiCredentials } from "@/lib/security/client-auth";

type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
};

type AuthContextValue = AuthState & {
  authReady: boolean;
  devStandalone: boolean;
  loginWithGoogleIdToken: (googleIdToken: string) => Promise<void>;
  loginAsDevUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const emptyState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const DEV_STANDALONE =
  process.env.NEXT_PUBLIC_LEARN_DEV_STANDALONE?.trim().toLowerCase() === "true";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(emptyState);
  const [authReady, setAuthReady] = useState(false);

  const bootstrap = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", withApiCredentials());
      if (!res.ok) {
        await fetch(
          "/api/auth/logout",
          withApiCredentials({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          }),
        );
        setState(emptyState);
        return;
      }
      const data = (await res.json()) as { user?: AuthUser };
      if (data.user?.id) {
        setState({ isAuthenticated: true, user: data.user });
      } else {
        setState(emptyState);
      }
    } catch {
      setState(emptyState);
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const loginWithGoogleIdToken = useCallback(async (googleIdToken: string) => {
    const res = await fetch(
      "/api/auth/google",
      withApiCredentials({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: googleIdToken }),
      }),
    );
    if (!res.ok) {
      throw new Error("Google sign-in failed.");
    }
    await bootstrap();
  }, [bootstrap]);

  const loginAsDevUser = useCallback(async () => {
    const res = await fetch(
      "/api/auth/dev-login",
      withApiCredentials({ method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }),
    );
    if (!res.ok) {
      throw new Error("Dev sign-in failed.");
    }
    await bootstrap();
  }, [bootstrap]);

  const logout = useCallback(() => {
    void fetch(
      "/api/auth/logout",
      withApiCredentials({ method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }),
    );
    setState(emptyState);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      authReady,
      devStandalone: DEV_STANDALONE,
      loginWithGoogleIdToken,
      loginAsDevUser,
      logout,
    }),
    [authReady, loginAsDevUser, loginWithGoogleIdToken, logout, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
