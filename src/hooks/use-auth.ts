"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type { AuthResponse, Role, User } from "@/lib/types";

export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.post<AuthResponse>("/auth/login", { email, password }, { auth: false }),
    onSuccess: (data) => {
      setSession(data);
      toast.success(`Welcome back, ${data.user.name}`);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      role?: "TENANT" | "OWNER";
    }) => api.post<AuthResponse>("/auth/register", payload, { auth: false }),
    onSuccess: (data) => {
      setSession(data);
      toast.success(`Account created. Welcome, ${data.user.name}!`);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Registration failed");
    },
  });

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", { refreshToken: useAuthStore.getState().refreshToken });
    } catch {
      /* token already invalid — clearing locally anyway */
    }
    clearSession();
    toast.success("Signed out");
    router.replace("/login");
  }, [clearSession, router]);

  const updateProfile = useCallback(
    (patch: Partial<Pick<User, "name" | "phone" | "avatarUrl">> & Record<string, unknown>) => {
      const current = useAuthStore.getState().user;
      if (current) setUser({ ...current, ...patch });
    },
    [setUser]
  );

  const homeFor = useCallback((role: Role | undefined): string => {
    switch (role) {
      case "ADMIN":
        return "/admin";
      case "OWNER":
        return "/provider";
      default:
        return "/dashboard";
    }
  }, []);

  const redirectAfterAuth = useCallback(
    (role: Role | undefined, next?: string | null) => {
      router.replace(next && next.startsWith("/") ? next : homeFor(role));
    },
    [homeFor, router]
  );

  return {
    user,
    isAuthenticated: Boolean(user && accessToken),
    isLoading: loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutateAsync,
    loginMutation,
    register: registerMutation.mutateAsync,
    registerMutation,
    logout,
    updateProfile,
    homeFor,
    redirectAfterAuth,
  };
}

/**
 * Verifies the persisted token against /auth/me inside protected layouts.
 * Clears the session and bounces to /login when it is no longer valid.
 */
export function useSessionQuery(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useQuery({
    queryKey: ["session"],
    enabled: enabled && Boolean(accessToken),
    retry: 1,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const user = await api.get<User>("/auth/me");
        setUser(user);
        return user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) clearSession();
        throw error;
      }
    },
  });
}
