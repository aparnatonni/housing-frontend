"use client";

import { RouteError } from "@/components/route-error";

export default function ListingDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError error={error} reset={reset} title="This listing failed to load" />;
}
