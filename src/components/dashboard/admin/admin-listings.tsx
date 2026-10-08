"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, ExternalLink } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ListingStatus, Paginated, PropertySummary } from "@/lib/types";
import { DataTable, LoadingButton, PaginationBar, type Column } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import { StatusBadge } from "@/components/status-badge";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { usePagination, useUrlParam } from "@/hooks/use-pagination";

export function AdminListings() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useUrlParam("search");
  const { page, setPage } = usePagination();

  const query = new URLSearchParams({ page: String(page), limit: "20", sortBy: "newest" });
  if (search) query.set("search", search);

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["admin-properties", query.toString()],
    queryFn: () =>
      api.get<Paginated<PropertySummary>>(`/properties?${query.toString()}`, { auth: false }),
  });

  React.useEffect(() => {
    if (isError)
      toast.error(error instanceof ApiError ? error.message : "Could not load listings");
  }, [isError, error]);

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingStatus }) =>
      api.patch(`/admin/properties/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      const key = ["admin-properties", query.toString()];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Paginated<PropertySummary>>(key);
      if (previous) {
        queryClient.setQueryData<Paginated<PropertySummary>>(key, {
          ...previous,
          items: previous.items.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        });
      }
      return { previous, key };
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
      toast.error(mutationError instanceof ApiError ? mutationError.message : "Could not update");
    },
    onSuccess: (_result, variables) => {
      toast.success(variables.status === "ACTIVE" ? "Listing activated" : "Listing deactivated");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-properties"] }),
  });

  const columns: Column<PropertySummary>[] = [
    {
      key: "property",
      header: "Listing",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
            <SafeImage src={row.images[0]} alt={row.title} fill sizes="44px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.address}, {row.city}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (row) => (
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          {row.propertyType}
        </span>
      ),
    },
    {
      key: "rooms",
      header: "Rooms",
      cell: (row) => <span className="text-sm">{row.roomCount}</span>,
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Open ${row.title}`}
            render={<Link href={`/listings/${row.id}`} target="_blank" />}
          >
            <ExternalLink aria-hidden />
          </Button>
          <LoadingButton
            size="xs"
            variant={row.status === "ACTIVE" ? "destructive" : "outline"}
            loading={setStatus.isPending && setStatus.variables?.id === row.id}
            onClick={() =>
              setStatus.mutate({
                id: row.id,
                status: row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              })
            }
          >
            {row.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </LoadingButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(value) => setSearch(value || null)}
          placeholder="Search listings…"
          className="w-full sm:w-72"
          label="Search listings"
        />
        <p className="text-xs text-muted-foreground">
          Admin property list endpoint is unavailable; showing public (active) listings.
        </p>
      </div>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isPending}
        empty={
          <EmptyState
            icon={Building2}
            title="No listings found"
            description="Adjust the search to find a listing. Inactive listings are hidden by the public API."
          />
        }
      />
      {data ? (
        <PaginationBar
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          onPageChange={setPage}
          isPending={isFetching}
        />
      ) : null}
    </div>
  );
}
