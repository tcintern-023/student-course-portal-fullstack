"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  type User,
} from "@/lib/api";
import { getToken, setToken, clearToken } from "@/lib/tokenStorage";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token is already stored (from a previous session),
  // validate it against the API and restore the user — or clear it if it's
  // invalid/expired. All setState calls happen inside .then()/.catch(),
  // never synchronously in the effect body.
  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (!getToken()) return null;
        return getCurrentUser();
      })
      .then((res) => {
        if (cancelled) return;
        if (res) setUser(res);
      })
      .catch(() => {
        if (cancelled) return;
        clearToken();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, token } = await loginUser({ email, password });
    setToken(token);
    setUser(loggedInUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user: newUser, token } = await registerUser({ name, email, password });
    setToken(token);
    setUser(newUser);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
