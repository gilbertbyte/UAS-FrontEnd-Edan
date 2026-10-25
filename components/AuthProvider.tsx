"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { User } from "@/lib/types";
import AuthModal from "./AuthModal";

type AuthContextType = {
  user: User | null; // null = belum login
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  openAuth: (tab?: "login" | "register") => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; tab: "login" | "register" }>({ open: false, tab: "login" });

  const refresh = useCallback(async () => {
    try {
      const me = await api<User>("/api/user/me");
      setUser(me.loggedIn ? me : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await api("/api/user/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  const openAuth = useCallback((tab: "login" | "register" = "login") => setModal({ open: true, tab }), []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, openAuth }}>
      {children}
      <AuthModal
        show={modal.open}
        initialTab={modal.tab}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onSuccess={refresh}
      />
    </AuthContext.Provider>
  );
}
