"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Paginated, PropertySummary } from "@/lib/types";
import { ListingCard } from "@/components/listings/listing-card";
import { SearchInput } from "@/components/search-input";
import { EmptyState } from "@/components/empty-state";
import { CardGridSkeleton } from "@/components/skeletons";
import { PaginationBar } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROPERTY_TYPES = [
  { value: "ALL", label: "All types" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "STUDIO", label: "Studio" },
  { value: "HOUSE", label: "House" },
  { value: "CONDO", label: "Condo" },
  { value: "DUPLEX", label: "Duplex" },
  { value: "ROOM", label: "Room" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

function buildQueryString(params: URLSearchParams): string {
  const query = new URLSearchParams();
  for (const key of ["city", "search", "propertyType", "minRent", "maxRent", "sortBy", "page", "limit"]) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  query.set("page", params.get("page") ?? "1");
  query.set("limit", params.get("limit") ?? "12");
  if (!query.get("sortBy")) query.set("sortBy", "newest");
  return query.toString();
}

export function ListingsBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [city, setCity] = React.useState(searchParams.get("city") ?? "");
  const [minRent, setMinRent] = React.useState(searchParams.get("minRent") ?? "");
  const [maxRent, setMaxRent] = React.useState(searchParams.get("maxRent") ?? "");
  const errorToastShown = React.useRef(false);

  const queryString = buildQueryString(searchParams);

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["properties", queryString],
    queryFn: () => api.get<Paginated<PropertySummary>>(`/properties?${queryString}`, { auth: false }),
  });

  React.useEffect(() => {
    if (isError && !errorToastShown.current) {
      errorToastShown.current = true;
      toast.error(error instanceof ApiError ? error.message : "Could not load listings");
    }
    if (!isError) errorToastShown.current = false;
  }, [isError, error]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `/listings?${qs}` : "/listings", { scroll: false });
  };

  const activeFilterCount = ["city", "search", "propertyType", "minRent", "maxRent"].filter(
    (key) => searchParams.get(key)
  ).length;

  return (
    <div className="space-y-6">
      {/* Filters — everything lives in the URL */}
      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,1fr)_auto]">
          <SearchInput
            value={searchParams.get("search") ?? ""}
            onChange={(value) => setParam("search", value)}
            placeholder="Keyword, address, title…"
            label="Search listings"
          />
          <div>
            <Label htmlFor="filter-city" className="sr-only">
              City
            </Label>
            <Input
              id="filter-city"
              placeholder="City"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              onBlur={() => setParam("city", city.trim())}
              onKeyDown={(event) => {
                if (event.key === "Enter") setParam("city", city.trim());
              }}
            />
          </div>
          <div>
            <Label htmlFor="filter-min" className="sr-only">
              Minimum rent
            </Label>
            <Input
              id="filter-min"
              type="number"
              min={0}
              placeholder="Min $"
              value={minRent}
              onChange={(event) => setMinRent(event.target.value)}
              onBlur={() => setParam("minRent", minRent)}
            />
          </div>
          <div>
            <Label htmlFor="filter-max" className="sr-only">
              Maximum rent
            </Label>
            <Input
              id="filter-max"
              type="number"
              min={0}
              placeholder="Max $"
              value={maxRent}
              onChange={(event) => setMaxRent(event.target.value)}
              onBlur={() => setParam("maxRent", maxRent)}
            />
          </div>
          <Select
            value={searchParams.get("propertyType") ?? "ALL"}
            onValueChange={(value) => setParam("propertyType", value && value !== "ALL" ? value : "")}
          >
            <SelectTrigger className="w-full" aria-label="Property type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={searchParams.get("sortBy") ?? "newest"}
            onValueChange={(value) => setParam("sortBy", value ?? "newest")}
          >
            <SelectTrigger className="w-full lg:w-44" aria-label="Sort listings">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            <SlidersHorizontal className="mr-1 inline size-3.5" aria-hidden />
            {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"} applied
            {isFetching && !isPending ? " · refreshing…" : ""}
          </span>
          {activeFilterCount > 0 ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => router.replace("/listings", { scroll: false })}
            >
              Clear all
            </Button>
          ) : null}
        </div>
      </div>

      {isPending ? (
        <CardGridSkeleton count={9} />
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Listings could not be loaded"
          description={
            error instanceof ApiError
              ? error.message
              : "The API did not respond. It may be waking up — try again."
          }
          action={{ label: "Retry", href: "/listings" }}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="No listings match your filters"
          description="Try a different city or widen your budget range."
          action={{ label: "Clear filters", href: "/listings" }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((property) => (
              <ListingCard key={property.id} property={property} />
            ))}
          </div>
          <PaginationBar
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            onPageChange={(page) => {
              const params = new URLSearchParams(searchParams.toString());
              if (page <= 1) params.delete("page");
              else params.set("page", String(page));
              const qs = params.toString();
              router.replace(qs ? `/listings?${qs}` : "/listings");
            }}
            isPending={isFetching}
          />
        </>
      )}
    </div>
  );
}
