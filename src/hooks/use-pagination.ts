"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UsePaginationOptions {
  /** Name of the URL search param that holds the page number. */
  key?: string;
  defaultLimit?: number;
  totalPages?: number;
}

/**
 * Pagination state synced to the URL (?page=2). Filter/sort/search state
 * lives in the URL too (AGENTS.md rule 6).
 */
export function usePagination({
  key = "page",
  defaultLimit = 12,
  totalPages,
}: UsePaginationOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get(key) ?? "1") || 1);
  const limit = Math.max(1, Number(searchParams.get("limit") ?? String(defaultLimit)) || defaultLimit);

  const setPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextPage <= 1) params.delete(key);
      else params.set(key, String(nextPage));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [key, pathname, router, searchParams]
  );

  const setLimit = useCallback(
    (nextLimit: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", String(nextLimit));
      params.delete(key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [key, pathname, router, searchParams]
  );

  return useMemo(
    () => ({ page, limit, setPage, setLimit, totalPages }),
    [page, limit, setPage, setLimit, totalPages]
  );
}

/** Generic URL search-param state helper for filters. */
export function useUrlParam(name: string): [string, (value: string | null) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(name) ?? "";

  const setValue = useCallback(
    (next: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!next) params.delete(name);
      else params.set(name, next);
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [name, pathname, router, searchParams]
  );

  return [value, setValue];
}
