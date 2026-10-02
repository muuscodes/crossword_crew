import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest, setUnauthorizedListener } from "../lib/api";
import type { User } from "../components/utils/types";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth";

interface AuthState {
  status: AuthStatus;
  user: User | null;
}

const LOGGED_OUT: AuthState = { status: "unauthenticated", user: null };

// Restores the session once when the app loads (the session cookie survives page reloads),
// and logs the person out in the app whenever the server reports the session has ended.
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: "loading", user: null });

  useEffect(() => {
    let cancelled = false;
    setUnauthorizedListener(() => setAuth(LOGGED_OUT));
    apiRequest<{ user: User }>("/auth/session")
      .then(({ user }) => {
        if (!cancelled) setAuth({ status: "authenticated", user });
      })
      .catch(() => {
        if (!cancelled) setAuth(LOGGED_OUT);
      });
    return () => {
      cancelled = true;
      setUnauthorizedListener(null);
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { user } = await apiRequest<{ user: User }>("/auth/login", {
      method: "POST",
      body: { username, password },
    });
    setAuth({ status: "authenticated", user });
  }, []);

  const signup = useCallback(async (email: string, username: string, password: string) => {
    const { user } = await apiRequest<{ user: User }>("/auth/signup", {
      method: "POST",
      body: { email, username, password },
    });
    setAuth({ status: "authenticated", user });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      setAuth(LOGGED_OUT);
    }
  }, []);

  const updateUser = useCallback((user: User) => setAuth({ status: "authenticated", user }), []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...auth, login, signup, logout, updateUser }),
    [auth, login, signup, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
