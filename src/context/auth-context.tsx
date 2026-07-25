"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ROUTES } from "@/constants/routes";
import {
  authedFetch,
  isClientDevStandalone,
  withApiCredentials,
} from "@/lib/security/client-auth";

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
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginWithMpin: (email: string, mpin: string) => Promise<void>;
  loginWithGoogleIdToken: (googleIdToken: string) => Promise<void>;
  exchangeHandoffCode: (code: string) => Promise<void>;
  loginAsDevUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const emptyState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const DEV_STANDALONE = isClientDevStandalone();

async function throwIfAuthFailed(res: Response, fallback: string): Promise<void> {
  if (res.ok) return;
  const data = (await res.json().catch(() => null)) as { detail?: string } | null;
  throw new Error(data?.detail ?? fallback);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(emptyState);
  const [authReady, setAuthReady] = useState(false);

  const bootstrap = useCallback(async () => {
    try {
      const loadSession = async () => {
        const res = await authedFetch(ROUTES.API.AUTH.ME);
        if (!res.ok) return null;
        const data = (await res.json()) as { user?: AuthUser };
        return data.user?.id ? data.user : null;
      };

      let user = await loadSession();

      if (!user && DEV_STANDALONE) {
        const devRes = await fetch(
          ROUTES.API.AUTH.DEV_LOGIN,
          withApiCredentials({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          }),
        );
        if (devRes.ok) {
          user = await loadSession();
        }
      }

      if (user) {
        setState({ isAuthenticated: true, user });
      } else {
        await fetch(
          ROUTES.API.AUTH.LOGOUT,
          withApiCredentials({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          }),
        );
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

  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(
        ROUTES.API.AUTH.LOGIN,
        withApiCredentials({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }),
      );
      await throwIfAuthFailed(res, "Sign-in failed.");
      await bootstrap();
    },
    [bootstrap],
  );

  const loginWithMpin = useCallback(
    async (email: string, mpin: string) => {
      const res = await fetch(
        ROUTES.API.AUTH.LOGIN_MPIN,
        withApiCredentials({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, mpin }),
        }),
      );
      await throwIfAuthFailed(res, "Sign-in failed.");
      await bootstrap();
    },
    [bootstrap],
  );

  const loginWithGoogleIdToken = useCallback(
    async (googleIdToken: string) => {
      const res = await fetch(
        ROUTES.API.AUTH.GOOGLE,
        withApiCredentials({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: googleIdToken }),
        }),
      );
      await throwIfAuthFailed(res, `Google sign-in failed (${res.status}).`);
      await bootstrap();
    },
    [bootstrap],
  );

  const exchangeHandoffCode = useCallback(
    async (code: string) => {
      const res = await fetch(
        ROUTES.API.AUTH.HANDOFF,
        withApiCredentials({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }),
      );
      await throwIfAuthFailed(res, "SSO sign-in failed.");
      await bootstrap();
    },
    [bootstrap],
  );

  const loginAsDevUser = useCallback(async () => {
    const res = await fetch(
      ROUTES.API.AUTH.DEV_LOGIN,
      withApiCredentials({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
    );
    if (!res.ok) {
      throw new Error("Dev sign-in failed.");
    }
    await bootstrap();
  }, [bootstrap]);

  const logout = useCallback(() => {
    void fetch(
      ROUTES.API.AUTH.LOGOUT,
      withApiCredentials({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
    );
    setState(emptyState);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      authReady,
      devStandalone: DEV_STANDALONE,
      loginWithCredentials,
      loginWithMpin,
      loginWithGoogleIdToken,
      exchangeHandoffCode,
      loginAsDevUser,
      logout,
    }),
    [
      authReady,
      exchangeHandoffCode,
      loginAsDevUser,
      loginWithCredentials,
      loginWithGoogleIdToken,
      loginWithMpin,
      logout,
      state,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
