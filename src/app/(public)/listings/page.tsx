import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingsBrowser } from "@/components/listings/listings-browser";
import { CardGridSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "Browse listings",
  description:
    "Search live rooms, studios, apartments and houses on NestMate. Filter by city, budget and property type, sort by price or date.",
  openGraph: {
    title: "Browse listings · NestMate",
    description: "Search live rooms, studios, apartments and houses on NestMate.",
  },
};

export default function ListingsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Browse listings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live availability from the NestMate API — filters and pagination are reflected in the
          URL, so you can share any view.
        </p>
      </div>
      <Suspense fallback={<CardGridSkeleton count={9} />}>
        <ListingsBrowser />
      </Suspense>
    </div>
  );
}
