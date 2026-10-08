"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

/** Shared error.tsx body for route groups. */
export function RouteError({
  error,
  reset,
  title = "Could not load this page",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : error.message || "An unexpected error occurred. Please retry.";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-5 text-destructive" aria-hidden />
      </span>
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <Button
        className="mt-2"
        onClick={() => {
          toast.info("Retrying…");
          reset();
        }}
      >
        <RotateCcw aria-hidden /> Try again
      </Button>
    </div>
  );
}
