"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";

/**
 * Global error boundary. Shown when a route throws during render or in a
 * client data hook that bubbles up. API failures also toast (see hooks).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface unexpected errors in the console for debugging.
    console.error(error);
  }, [error]);

  const isApiError = error instanceof ApiError;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" aria-hidden />
      </span>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {isApiError ? "Something went wrong talking to the API" : "Something went wrong"}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message ||
          "An unexpected error occurred. Please try again — if it keeps happening, check your connection."}
      </p>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">Error ref: {error.digest}</p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <Button onClick={reset}>
          <RotateCcw aria-hidden /> Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.assign("/")}>
          Go home
        </Button>
      </div>
    </div>
  );
}
