import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Compass className="size-6 text-muted-foreground" aria-hidden />
      </span>
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist or may have moved. Try browsing listings
        instead.
      </p>
      <div className="mt-2 flex gap-2">
        <Button render={<Link href="/" />}>Back home</Button>
        <Button variant="outline" render={<Link href="/listings" />}>
          Browse listings
        </Button>
      </div>
    </div>
  );
}
