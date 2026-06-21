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
      const loadSession = async () => {
        const res = await fetch(ROUTES.API.AUTH.ME, withApiCredentials());
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

  const loginWithGoogleIdToken = useCallback(async (googleIdToken: string) => {
    const res = await fetch(
      ROUTES.API.AUTH.GOOGLE,
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
      ROUTES.API.AUTH.DEV_LOGIN,
      withApiCredentials({ method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }),
    );
    if (!res.ok) {
      throw new Error("Dev sign-in failed.");
    }
    await bootstrap();
  }, [bootstrap]);

  const logout = useCallback(() => {
    void fetch(
      ROUTES.API.AUTH.LOGOUT,
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
