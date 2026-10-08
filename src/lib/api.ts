import { getStoredTokens, useAuthStore } from "@/lib/auth-store";
import type { ApiEnvelope } from "@/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://housing-backend-2-pr71.onrender.com/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /** First human-readable message for a given form field, if any. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

export function apiUrl(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type RequestInitLike = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Set to false for public endpoints that never need a token. */
  auth?: boolean;
};

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (!payload.success) {
    throw new ApiError(400, payload.message || "Request failed", payload.errors ?? {});
  }
  return payload.data;
}

async function toApiError(res: Response): Promise<ApiError> {
  let message = `Request failed (${res.status})`;
  let errors: Record<string, string[]> = {};
  try {
    const payload = (await res.json()) as Partial<ApiEnvelope<unknown>>;
    if (payload.message) message = payload.message;
    if (payload.errors) errors = payload.errors;
  } catch {
    /* non-JSON body */
  }
  if (res.status === 401 && !message) message = "Authentication required";
  return new ApiError(res.status, message, errors);
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = getStoredTokens();
      if (!refreshToken) return false;
      try {
        const res = await fetch(apiUrl("/auth/refresh-token"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const payload = (await res.json()) as ApiEnvelope<{
          accessToken?: string;
          refreshToken?: string;
          user?: unknown;
        }>;
        const data = payload.data ?? {};
        const store = useAuthStore.getState();
        const nextAccess = data.accessToken ?? null;
        const nextRefresh = data.refreshToken ?? null;
        if (!nextAccess) return false;
        store.setSession({
          user: store.user ?? (data.user as never),
          accessToken: nextAccess,
          refreshToken: nextRefresh ?? refreshToken,
        });
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, init: RequestInitLike = {}): Promise<T> {
  const { auth = true, body, headers, ...rest } = init;

  const doFetch = async (): Promise<Response> => {
    const finalHeaders = new Headers(headers);
    finalHeaders.set("Accept", "application/json");
    if (body !== undefined && !(body instanceof FormData)) {
      finalHeaders.set("Content-Type", "application/json");
    }
    if (auth) {
      const { accessToken } = getStoredTokens();
      if (accessToken) finalHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
    return fetch(apiUrl(path), {
      ...rest,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      cache: "no-store",
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth) {
    const refreshed = await refreshSession();
    if (refreshed) res = await doFetch();
    else {
      useAuthStore.getState().clearSession();
      throw await toApiError(res);
    }
  }

  if (!res.ok) throw await toApiError(res);

  if (res.status === 204) return undefined as T;

  const payload = (await res.json()) as ApiEnvelope<T>;
  return unwrap<T>(payload);
}

export const api = {
  get: <T>(path: string, init?: RequestInitLike) =>
    apiRequest<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestInitLike) =>
    apiRequest<T>(path, { ...init, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, init?: RequestInitLike) =>
    apiRequest<T>(path, { ...init, method: "PATCH", body }),
  del: <T>(path: string, init?: RequestInitLike) =>
    apiRequest<T>(path, { ...init, method: "DELETE" }),
  upload: <T>(path: string, form: FormData, init?: RequestInitLike) =>
    apiRequest<T>(path, { ...init, method: "POST", body: form }),
};

/**
 * Server-side fetch for public endpoints (Server Components).
 * Uses ISR revalidation so public pages stay fast.
 */
export async function serverFetch<T>(
  path: string,
  init: RequestInit & { revalidate?: number | false } = {}
): Promise<T> {
  const { revalidate = 300, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...rest,
      headers: { Accept: "application/json", ...(rest.headers ?? {}) },
      next: { revalidate },
    });
  } catch {
    throw new ApiError(0, "Cannot reach the API. It may be waking up — please retry.");
  }
  if (!res.ok) throw await toApiError(res);
  const payload = (await res.json()) as ApiEnvelope<T>;
  return unwrap<T>(payload);
}
