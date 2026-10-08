"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCheck, Check, Wrench, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type {
  MaintenanceRequest,
  MaintenanceStatus,
  Paginated,
  ViewingRequest,
} from "@/lib/types";
import { DataTable, type Column } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDate,
  useMyProperties,
  useReceivedViewings,
} from "@/components/dashboard/provider/provider-data";

const VIEWING_STATUSES = ["ALL", "PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"];

export function ReceivedViewingRequests() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const status = statusFilter === "ALL" ? "" : statusFilter;
  const { data, isPending, isError, error } = useReceivedViewings(status);

  React.useEffect(() => {
    if (isError)
      toast.error(error instanceof ApiError ? error.message : "Could not load viewing requests");
  }, [isError, error]);

  const updateStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) =>
      api.patch<ViewingRequest>(`/viewing-requests/${id}/status`, { status: next }),
    onMutate: async ({ id, next }) => {
      const key = ["received-viewings", status];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Paginated<ViewingRequest>>(key);
      if (previous) {
        queryClient.setQueryData<Paginated<ViewingRequest>>(key, {
          ...previous,
          items: previous.items.map((item) =>
            item.id === id ? { ...item, status: next as ViewingRequest["status"] } : item
          ),
        });
      }
      return { previous, key };
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
      toast.error(
        mutationError instanceof ApiError ? mutationError.message : "Could not update the request"
      );
    },
    onSuccess: (_result, variables) => {
      toast.success(
        variables.next === "APPROVED" ? "Viewing approved" : `Request marked ${variables.next.toLowerCase()}`
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["received-viewings"] }),
  });

  const columns: Column<ViewingRequest>[] = [
    {
      key: "tenant",
      header: "Tenant",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={row.tenant?.avatarUrl ?? undefined} alt={row.tenant?.name ?? "Tenant"} />
            <AvatarFallback>
              {(row.tenant?.name ?? "?").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.tenant?.name ?? "Tenant"}</p>
            <p className="truncate text-xs text-muted-foreground">{row.tenant?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "room",
      header: "Room",
      cell: (row) => (
        <div>
          <p className="text-sm">{row.room?.property?.title ?? "Room"}</p>
          <p className="text-xs text-muted-foreground">
            {row.room?.roomType} · {row.room?.property?.city}
          </p>
        </div>
      ),
    },
    {
      key: "requestedDate",
      header: "Requested",
      cell: (row) => (
        <span className="text-sm">
          {new Date(row.requestedDate).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      cell: (row) => (
        <span className="block max-w-[16rem] truncate text-xs text-muted-foreground">
          {row.notes || "—"}
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) =>
        row.status === "PENDING" ? (
          <div className="flex justify-end gap-1">
            <Button
              size="xs"
              disabled={updateStatus.isPending && updateStatus.variables?.id === row.id}
              onClick={() => updateStatus.mutate({ id: row.id, next: "APPROVED" })}
            >
              <Check aria-hidden /> Approve
            </Button>
            <Button
              size="xs"
              variant="outline"
              disabled={updateStatus.isPending && updateStatus.variables?.id === row.id}
              onClick={() => updateStatus.mutate({ id: row.id, next: "REJECTED" })}
            >
              <X aria-hidden /> Decline
            </Button>
          </div>
        ) : row.status === "APPROVED" ? (
          <Button
            size="xs"
            variant="outline"
            disabled={updateStatus.isPending && updateStatus.variables?.id === row.id}
            onClick={() => updateStatus.mutate({ id: row.id, next: "COMPLETED" })}
          >
            Mark completed
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Requests from tenants who want to see one of your rooms.
        </p>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "ALL")}>
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIEWING_STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "ALL" ? "All statuses" : option.charAt(0) + option.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isPending}
        empty={
          <EmptyState
            icon={CalendarCheck}
            title="No viewing requests"
            description="When a tenant asks to visit one of your rooms it will appear here for approval."
          />
        }
      />
    </div>
  );
}

const MAINTENANCE_STATUSES: MaintenanceStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export function PropertyMaintenance() {
  const queryClient = useQueryClient();
  const { data: properties } = useMyProperties(1, 50);
  const [propertyId, setPropertyId] = React.useState("");

  const activePropertyId = propertyId || properties?.items[0]?.id || "";

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["property-maintenance", activePropertyId],
    enabled: Boolean(activePropertyId),
    queryFn: () =>
      api.get<MaintenanceRequest[]>(`/maintenance-requests/property/${activePropertyId}`),
  });

  React.useEffect(() => {
    if (isError)
      toast.error(error instanceof ApiError ? error.message : "Could not load maintenance requests");
  }, [isError, error]);

  const updateStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: MaintenanceStatus }) =>
      api.patch<MaintenanceRequest>(`/maintenance-requests/${id}/status`, { status: next }),
    onMutate: async ({ id, next }) => {
      const key = ["property-maintenance", activePropertyId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MaintenanceRequest[]>(key);
      if (previous) {
        queryClient.setQueryData<MaintenanceRequest[]>(
          key,
          previous.map((item) => (item.id === id ? { ...item, status: next } : item))
        );
      }
      return { previous, key };
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
      toast.error(
        mutationError instanceof ApiError ? mutationError.message : "Could not update the request"
      );
    },
    onSuccess: () => toast.success("Maintenance status updated"),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["property-maintenance", activePropertyId] }),
  });

  const columns: Column<MaintenanceRequest>[] = [
    {
      key: "issue",
      header: "Issue",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{row.category}</p>
          <p className="max-w-[18rem] truncate text-xs text-muted-foreground">{row.description}</p>
        </div>
      ),
    },
    {
      key: "tenant",
      header: "Reported by",
      cell: (row) => (
        <span className="text-sm">
          {row.tenant.name}
          <span className="block text-xs text-muted-foreground">{row.tenant.phone || row.tenant.email}</span>
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      cell: (row) => <StatusBadge status={row.priority} />,
    },
    {
      key: "createdAt",
      header: "Reported",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <select
          aria-label={`Update status for ${row.category}`}
          value={row.status}
          disabled={updateStatus.isPending && updateStatus.variables?.id === row.id}
          onChange={(event) => updateStatus.mutate({ id: row.id, next: event.target.value as MaintenanceStatus })}
          className="h-7 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {MAINTENANCE_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      ),
    },
  ];

  if (!properties || properties.items.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No properties yet"
        description="Post a listing first — maintenance requests from its tenants will appear here."
        action={{ label: "Post a listing", href: "/provider/new" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Track and resolve issues reported by tenants.
        </p>
        <Select value={activePropertyId} onValueChange={(value) => setPropertyId(value ?? "")}>
          <SelectTrigger className="w-64" aria-label="Choose property">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {properties.items.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(row) => row.id}
        isLoading={isPending}
        empty={
          <EmptyState
            icon={Wrench}
            title="No maintenance requests"
            description="Nothing reported for this property. Good news — all quiet."
          />
        }
      />
    </div>
  );
}
