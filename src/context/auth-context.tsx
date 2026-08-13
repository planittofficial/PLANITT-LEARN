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
  isClientDevAutoLogin,
  isClientDevStandalone,
  withApiCredentials,
} from "@/lib/security/client-auth";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  roles?: string[];
  isAdmin?: boolean;
};

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isAdmin: boolean;
};

type AuthContextValue = AuthState & {
  authReady: boolean;
  devStandalone: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<AuthState>;
  loginWithMpin: (email: string, mpin: string) => Promise<AuthState>;
  loginWithGoogleIdToken: (googleIdToken: string) => Promise<AuthState>;
  exchangeHandoffCode: (code: string) => Promise<AuthState>;
  loginAsDevUser: () => Promise<AuthState>;
  logout: () => void;
  updateLocalUser: (patch: Partial<Pick<AuthUser, "name">>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const emptyState: AuthState = {
  isAuthenticated: false,
  user: null,
  isAdmin: false,
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

  const bootstrap = useCallback(async (): Promise<AuthState> => {
    try {
      const loadSession = async () => {
        const res = await authedFetch(ROUTES.API.AUTH.ME);
        if (!res.ok) return null;
        const data = (await res.json()) as { user?: AuthUser };
        return data.user?.id ? data.user : null;
      };

      let user = await loadSession();

      if (!user && DEV_STANDALONE && isClientDevAutoLogin()) {
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
        let isAdmin = false;
        try {
          const adminRes = await authedFetch(ROUTES.API.AUTH.ADMIN);
          if (adminRes.ok) {
            const adminData = await adminRes.json();
            isAdmin = !!adminData.isAdmin;
          }
        } catch {
          // Default to false on failure
        }
        const next: AuthState = { isAuthenticated: true, user, isAdmin };
        setState(next);
        return next;
      }

      // Do not clear cookies here — a failed /me must not wipe a just-issued session.
      setState(emptyState);
      return emptyState;
    } catch {
      setState(emptyState);
      return emptyState;
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
      const next = await bootstrap();
      if (!next.isAuthenticated) {
        throw new Error("Signed in, but session could not be established. Try again.");
      }
      return next;
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
      const next = await bootstrap();
      if (!next.isAuthenticated) {
        throw new Error("Signed in, but session could not be established. Try again.");
      }
      return next;
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
      const next = await bootstrap();
      if (!next.isAuthenticated) {
        throw new Error("Signed in, but session could not be established. Try again.");
      }
      return next;
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
      const next = await bootstrap();
      if (!next.isAuthenticated) {
        throw new Error("Signed in, but session could not be established. Try again.");
      }
      return next;
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
    const next = await bootstrap();
    if (!next.isAuthenticated) {
      throw new Error("Signed in, but session could not be established. Try again.");
    }
    return next;
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

  const updateLocalUser = useCallback((patch: Partial<Pick<AuthUser, "name">>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      return {
        ...prev,
        user: {
          ...prev.user,
          ...patch,
          name: patch.name?.trim() || prev.user.name,
        },
      };
    });
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
      updateLocalUser,
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
      updateLocalUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
