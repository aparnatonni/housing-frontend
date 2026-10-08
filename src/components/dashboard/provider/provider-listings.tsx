"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, ExternalLink, PlusCircle, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ListingStatus, Paginated, PropertySummary } from "@/lib/types";
import { DataTable, LoadingButton, type Column } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { SafeImage } from "@/components/safe-image";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatMoney, useMyProperties } from "@/components/dashboard/provider/provider-data";

export function MyListingsTable({ search = "" }: { search?: string }) {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error } = useMyProperties(1, 50, search);
  const [pendingDelete, setPendingDelete] = React.useState<PropertySummary | null>(null);

  React.useEffect(() => {
    if (isError) toast.error(error instanceof ApiError ? error.message : "Could not load listings");
  }, [isError, error]);

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingStatus }) =>
      api.patch<PropertySummary>(`/properties/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      const key = ["my-properties", new URLSearchParams({ page: "1", limit: "50", ...(search ? { search } : {}) }).toString()];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Paginated<PropertySummary>>(key);
      if (previous) {
        queryClient.setQueryData<Paginated<PropertySummary>>(key, {
          ...previous,
          items: previous.items.map((item) => (item.id === id ? { ...item, status } : item)),
        });
      }
      return { previous, key };
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
      toast.error(
        mutationError instanceof ApiError ? mutationError.message : "Could not update the listing"
      );
    },
    onSuccess: (updated) => {
      toast.success(updated.status === "ACTIVE" ? "Listing published" : "Listing unpublished");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["my-properties"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/properties/${id}`),
    onSuccess: () => {
      toast.success("Listing deleted");
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      setPendingDelete(null);
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof ApiError ? mutationError.message : "Could not delete");
    },
  });

  const columns: Column<PropertySummary>[] = [
    {
      key: "property",
      header: "Property",
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
      cell: (row) => (
        <span className="text-sm">
          {row.roomCount}
          <span className="block text-xs text-muted-foreground">
            {row.minRent === null ? "no price yet" : `from ${formatMoney(row.minRent)}/mo`}
          </span>
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`View ${row.title}`}
            render={<Link href={`/listings/${row.id}`} target="_blank" />}
          >
            <ExternalLink aria-hidden />
          </Button>
          <LoadingButton
            variant="outline"
            size="xs"
            loading={toggleStatus.isPending && toggleStatus.variables?.id === row.id}
            onClick={() =>
              toggleStatus.mutate({
                id: row.id,
                status: row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              })
            }
          >
            {row.status === "ACTIVE" ? "Unpublish" : "Publish"}
          </LoadingButton>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Delete ${row.title}`}
            className="text-destructive hover:text-destructive"
            onClick={() => setPendingDelete(row)}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isPending}
        empty={
          <EmptyState
            icon={Building2}
            title="No listings yet"
            description="Post your first property and rooms to start receiving applications."
            action={{ label: "Post a listing", href: "/provider/new" }}
          />
        }
      />

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete listing?</DialogTitle>
            <DialogDescription>
              &ldquo;{pendingDelete?.title}&rdquo; will be removed from the public listings. This
              cannot be undone from the dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              loading={remove.isPending}
              onClick={() => pendingDelete && remove.mutate(pendingDelete.id)}
            >
              Delete listing
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MyListingsHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight">My listings</h2>
        <p className="text-sm text-muted-foreground">
          Publish, pause or remove the properties you rent out.
        </p>
      </div>
      <Button size="sm" render={<Link href="/provider/new" />}>
        <PlusCircle aria-hidden /> Post a listing
      </Button>
    </div>
  );
}
