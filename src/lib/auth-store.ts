"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
}

/** Cookie read by middleware.ts for role-based route protection. */
export function writeSessionCookie(user: User) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `hh_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax${secure}`;
  document.cookie = `hh_uid=${user.id}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax${secure}`;
}

export function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "hh_role=; path=/; max-age=0; samesite=lax";
  document.cookie = "hh_uid=; path=/; max-age=0; samesite=lax";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: ({ user, accessToken, refreshToken }) => {
        writeSessionCookie(user);
        set({ user, accessToken, refreshToken });
      },
      setUser: (user) => {
        writeSessionCookie(user);
        set({ user });
      },
      clearSession: () => {
        clearSessionCookie();
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: "housing-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/** Read the raw persisted session (used by the API client outside React). */
export function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  try {
    const raw = window.localStorage.getItem("housing-auth");
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string | null; refreshToken?: string | null };
    };
    return {
      accessToken: parsed.state?.accessToken ?? null,
      refreshToken: parsed.state?.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

/** True once the persisted auth store has been rehydrated on the client. */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAuthStore.persist.hasHydrated());
    return unsubscribe;
  }, []);

  return hydrated;
}
