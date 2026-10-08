"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Paginated, PropertySummary, ViewingRequest } from "@/lib/types";

export function useMyProperties(page = 1, limit = 50, search = "") {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) qs.set("search", search);
  return useQuery({
    queryKey: ["my-properties", qs.toString()],
    queryFn: () => api.get<Paginated<PropertySummary>>(`/properties/my-properties?${qs.toString()}`),
  });
}

export function useReceivedViewings(status = "") {
  const qs = new URLSearchParams({ page: "1", limit: "50" });
  if (status) qs.set("status", status);
  return useQuery({
    queryKey: ["received-viewings", status],
    queryFn: () =>
      api.get<Paginated<ViewingRequest>>(`/viewing-requests/received?${qs.toString()}`),
  });
}

export function formatMoney(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
