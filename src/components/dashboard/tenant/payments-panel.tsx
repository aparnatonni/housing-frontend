"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Receipt, Split } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { BillSplit, Paginated, Payment, RentPayment, RentPaymentsResponse } from "@/lib/types";
import { DataTable, LoadingButton, PaginationBar, type Column } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { SafeImage } from "@/components/safe-image";
import { useMyTenancy } from "@/components/dashboard/tenant/tenant-data";

interface InitiateResponse {
  gatewayPageURL?: string;
  tranId?: string;
  [key: string]: unknown;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function useInitiatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { type: "RENT" | "BILL"; referenceId: string }) =>
      api.post<InitiateResponse>("/payments/initiate", payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rent-payments"] });
      if (data.gatewayPageURL) {
        toast.info("Redirecting to secure checkout…");
        window.location.assign(data.gatewayPageURL);
      } else {
        toast.error("The gateway did not return a checkout URL");
      }
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not start payment");
    },
  });
}

export function RentPaymentsPanel() {
  const { data: tenancy, isPending: tenancyPending } = useMyTenancy();
  const initiate = useInitiatePayment();

  const { data: rentPayments, isPending } = useQuery({
    queryKey: ["rent-payments", tenancy?.id],
    enabled: Boolean(tenancy?.id),
    queryFn: () =>
      api.get<RentPaymentsResponse>(`/tenancies/${tenancy?.id}/rent-payments`),
  });

  const rentRows = [...(rentPayments?.upcoming ?? []), ...(rentPayments?.history ?? [])];

  const columns: Column<RentPayment>[] = [
    {
      key: "period",
      header: "Rent for",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">
            {row.period ? row.period : formatDate(row.dueDate)}
          </p>
          <p className="text-xs text-muted-foreground">Due {formatDate(row.dueDate)}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row) => <span className="text-sm font-medium">{formatMoney(row.amount)}</span>,
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "paidAt",
      header: "Paid on",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.paidAt ? formatDate(row.paidAt) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) =>
        row.status === "PAID" ? null : (
          <LoadingButton
            size="xs"
            loading={initiate.isPending && initiate.variables?.referenceId === row.id}
            onClick={() => initiate.mutate({ type: "RENT", referenceId: row.id })}
          >
            <CreditCard aria-hidden /> Pay now
          </LoadingButton>
        ),
    },
  ];

  if (tenancyPending) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" aria-busy="true" />;
  }

  if (!tenancy) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No active tenancy yet"
        description="Rent payments appear here once a landlord approves your application."
        action={{ label: "Browse listings", href: "/listings" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          <SafeImage
            src={tenancy.room?.property.images[0]}
            alt={tenancy.room?.property.title ?? "Property"}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-medium">{tenancy.room?.property.title}</p>
          <p className="text-xs text-muted-foreground">
            {tenancy.room?.roomType} room · {formatMoney(tenancy.rentAmount)}/mo · since{" "}
            {formatDate(tenancy.startDate)}
          </p>
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={rentRows}
        rowKey={(row) => row.id}
        isLoading={isPending}
        empty={
          <EmptyState
            icon={Receipt}
            title="No rent invoices yet"
            description="Your landlord generates rent invoices; they will show up here."
          />
        }
      />
    </div>
  );
}

export function BillSplitsPanel() {
  const { data: tenancy } = useMyTenancy();
  const initiate = useInitiatePayment();
  const queryClient = useQueryClient();

  const { data: splits, isPending } = useQuery({
    queryKey: ["bill-splits", tenancy?.id],
    enabled: Boolean(tenancy?.id),
    queryFn: () => api.get<BillSplit[]>(`/bill-splits/tenancy/${tenancy?.id}`),
  });

  const settleShare = useMutation({
    mutationFn: (billSplitId: string) =>
      api.patch(`/bill-splits/${billSplitId}/settle-share`),
    onSuccess: () => {
      toast.success("Share marked as paid");
      queryClient.invalidateQueries({ queryKey: ["bill-splits", tenancy?.id] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not settle share");
    },
  });

  const rows = splits ?? [];

  const columns: Column<BillSplit>[] = [
    {
      key: "bill",
      header: "Bill",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{row.billType}</p>
          <p className="text-xs text-muted-foreground">Due {formatDate(row.dueDate)}</p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (row) => <span className="text-sm">{formatMoney(row.totalAmount)}</span>,
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          {row.status !== "SETTLED" ? (
            <>
              <LoadingButton
                size="xs"
                variant="outline"
                loading={settleShare.isPending && settleShare.variables === row.id}
                onClick={() => settleShare.mutate(row.id)}
              >
                Settle my share
              </LoadingButton>
              <LoadingButton
                size="xs"
                loading={initiate.isPending && initiate.variables?.referenceId === row.id}
                onClick={() => initiate.mutate({ type: "BILL", referenceId: row.id })}
              >
                <CreditCard aria-hidden /> Pay online
              </LoadingButton>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        isLoading={isPending}
        empty={
          <EmptyState
            icon={Split}
            title="No shared bills"
            description="When your landlord splits a utility bill across roommates, it appears here."
          />
        }
      />
    </div>
  );
}

export function PaymentHistoryPanel() {
  const [page, setPage] = React.useState(1);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["my-payments", page],
    queryFn: () => api.get<Paginated<Payment>>(`/payments/my-payments?page=${page}&limit=10`),
  });

  React.useEffect(() => {
    if (isError) toast.error(error instanceof ApiError ? error.message : "Could not load payments");
  }, [isError, error]);

  const columns: Column<Payment>[] = [
    {
      key: "tranId",
      header: "Transaction",
      cell: (row) => (
        <div>
          <p className="font-mono text-xs">{row.tranId}</p>
          <p className="text-xs text-muted-foreground">
            {row.purpose} · {row.gateway}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row) => (
        <span className="text-sm font-medium">
          {formatMoney(row.amount)} {row.currency ? row.currency.toUpperCase() : ""}
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "createdAt",
      header: "Date",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isPending}
        empty={
          <EmptyState
            icon={Receipt}
            title="No payments yet"
            description="Online rent and bill payments will be listed here with their gateway status."
            action={{ label: "Recheck", href: "/dashboard/payments" }}
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
      {isError ? (
        <p className="text-sm text-muted-foreground">
          Could not load payment history.{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Missing a payment after checkout?{" "}
        <Link
          href="/payment/success"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Check a payment status
        </Link>
        .
      </p>
    </div>
  );
}
