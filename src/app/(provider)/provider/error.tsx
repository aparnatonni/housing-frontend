"use client";

import { RouteError } from "@/components/route-error";

export default function ProviderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} title="Could not load your landlord dashboard" />;
}
