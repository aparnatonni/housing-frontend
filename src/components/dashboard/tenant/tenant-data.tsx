"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, DoorOpen, FileText, Wrench } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Application, MaintenanceRequest, Paginated, Tenancy, ViewingRequest } from "@/lib/types";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { SafeImage } from "@/components/safe-image";
import { Badge } from "@/components/ui/badge";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function MyApplications({ status }: { status?: string }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["my-applications", status ?? ""],
    queryFn: () =>
      api.get<Paginated<Application>>(
        `/applications/my-applications?limit=20${status ? `&status=${status}` : ""}`
      ),
  });

  React.useEffect(() => {
    if (isError) toast.error(error instanceof ApiError ? error.message : "Could not load applications");
  }, [isError, error]);

  const columns: Column<Application>[] = [
    {
      key: "property",
      header: "Property",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
            <SafeImage
              src={row.room.property.images[0]}
              alt={row.room.property.title}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <Link
              href={`/listings/${row.room.property.id}`}
              className="block truncate text-sm font-medium hover:text-primary"
            >
              {row.room.property.title}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {row.room.roomType} · {formatMoney(row.room.rentAmount)}/mo · {row.room.property.city}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "moveInDate",
      header: "Move-in",
      cell: (row) => <span className="text-sm">{formatDate(row.moveInDate)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "tenancy",
      header: "Tenancy",
      cell: (row) =>
        row.tenancy ? (
          <Badge variant="secondary">{row.tenancy.status}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "appliedOn",
      header: "Applied",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={data?.items ?? []}
      rowKey={(row) => row.id}
      isLoading={isPending}
      empty={
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Find a room you like and apply — its status will show up here."
          action={{ label: "Browse listings", href: "/listings" }}
        />
      }
    />
  );
}

export function MyViewingRequests({ status }: { status?: string }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["my-viewing-requests", status ?? ""],
    queryFn: () =>
      api.get<Paginated<ViewingRequest>>(
        `/viewing-requests/my-requests?limit=20${status ? `&status=${status}` : ""}`
      ),
  });

  React.useEffect(() => {
    if (isError)
      toast.error(error instanceof ApiError ? error.message : "Could not load viewing requests");
  }, [isError, error]);

  const columns: Column<ViewingRequest>[] = [
    {
      key: "room",
      header: "Room",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">
            {row.room?.property?.title ?? "Room"}
            {row.room ? ` · ${row.room.roomType}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.room?.property?.city ?? ""}
            {row.room ? ` · ${formatMoney(row.room.rentAmount)}/mo` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "requestedDate",
      header: "Requested date",
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden />
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
        <span className="block max-w-xs truncate text-xs text-muted-foreground">
          {row.notes || "—"}
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={data?.items ?? []}
      rowKey={(row) => row.id}
      isLoading={isPending}
      empty={
        <EmptyState
          icon={CalendarDays}
          title="No viewing requests"
          description="Open a listing and request a viewing to see it in person."
          action={{ label: "Find a home", href: "/listings" }}
        />
      }
    />
  );
}

export function MyMaintenance() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["my-maintenance"],
    queryFn: () => api.get<MaintenanceRequest[]>("/maintenance-requests/my-requests"),
  });

  React.useEffect(() => {
    if (isError)
      toast.error(error instanceof ApiError ? error.message : "Could not load maintenance requests");
  }, [isError, error]);

  const rows = data ?? [];

  const columns: Column<MaintenanceRequest>[] = [
    {
      key: "category",
      header: "Issue",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{row.category}</p>
          <p className="max-w-xs truncate text-xs text-muted-foreground">{row.description}</p>
        </div>
      ),
    },
    {
      key: "property",
      header: "Property",
      cell: (row) => (
        <span className="text-sm">
          {row.room.property.title}
          <span className="block text-xs text-muted-foreground">{row.room.property.city}</span>
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      cell: (row) => <StatusBadge status={row.priority} />,
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "createdAt",
      header: "Reported",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      isLoading={isPending}
      empty={
        <EmptyState
          icon={Wrench}
          title="No maintenance requests"
          description="If something breaks in your rented room, report it here."
        />
      }
    />
  );
}

export function useMyTenancy() {
  return useQuery({
    queryKey: ["my-tenancy"],
    retry: false,
    queryFn: async (): Promise<Tenancy | null> => {
      try {
        return await api.get<Tenancy>("/tenancies/my-tenancy");
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}

export function ActiveTenancyCard() {
  const { data, isPending } = useMyTenancy();

  if (isPending) {
    return <div className="h-28 animate-pulse rounded-xl bg-muted" aria-busy="true" />;
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
          <DoorOpen className="size-4 text-primary" aria-hidden />
          Current home
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You don&apos;t have an active tenancy yet. Get approved on an application and it will
          appear here.
        </p>
        <Link
          href="/listings"
          className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Browse listings
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
        <DoorOpen className="size-4 text-primary" aria-hidden />
        Current home
      </h2>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{data.room?.property.title}</p>
          <p className="text-xs text-muted-foreground">
            {data.room?.roomType} room · {data.room?.property.address}, {data.room?.property.city}
          </p>
        </div>
        <div className="text-right">
          <p className="font-heading text-lg font-semibold text-primary">
            {formatMoney(data.rentAmount)}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </p>
          <StatusBadge status={data.status} />
        </div>
      </div>
    </div>
  );
}
