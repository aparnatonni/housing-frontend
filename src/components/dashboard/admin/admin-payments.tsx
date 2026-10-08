"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Paginated, Payment } from "@/lib/types";
import { DataTable, PaginationBar, type Column } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination, useUrlParam } from "@/hooks/use-pagination";

const STATUSES = ["ALL", "PENDING", "SUCCESS", "FAILED"];
const GATEWAYS = ["ALL", "SSLCOMMERZ", "STRIPE", "CASH", "OTHER"];
const PURPOSES = ["ALL", "RENT", "BILL", "DEPOSIT", "OTHER"];

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function AdminPayments() {
  const [status, setStatus] = useUrlParam("payStatus");
  const [gateway, setGateway] = useUrlParam("gateway");
  const [purpose, setPurpose] = useUrlParam("purpose");
  const { page, setPage } = usePagination();

  const query = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) query.set("status", status);
  if (gateway) query.set("gateway", gateway);
  if (purpose) query.set("purpose", purpose);

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["admin-payments", query.toString()],
    queryFn: () => api.get<Paginated<Payment>>(`/admin/payments?${query.toString()}`),
  });

  React.useEffect(() => {
    if (isError)
      toast.error(error instanceof ApiError ? error.message : "Could not load payments");
  }, [isError, error]);

  const columns: Column<Payment>[] = [
    {
      key: "tranId",
      header: "Transaction",
      cell: (row) => (
        <div>
          <p className="font-mono text-xs">{row.tranId}</p>
          <p className="text-xs text-muted-foreground">{row.purpose}</p>
        </div>
      ),
    },
    {
      key: "payer",
      header: "Payer",
      cell: (row) => (
        <span className="text-sm">
          {row.payer?.name ?? "—"}
          <span className="block text-xs text-muted-foreground">{row.payer?.email ?? ""}</span>
        </span>
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
    {
      key: "gateway",
      header: "Gateway",
      cell: (row) => <span className="text-xs font-medium tracking-wide">{row.gateway}</span>,
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "createdAt",
      header: "Date",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={status || "ALL"} onValueChange={(value) => setStatus(!value || value === "ALL" ? null : value)}>
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "ALL" ? "All statuses" : option.charAt(0) + option.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={gateway || "ALL"} onValueChange={(value) => setGateway(!value || value === "ALL" ? null : value)}>
          <SelectTrigger className="w-40" aria-label="Filter by gateway">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GATEWAYS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "ALL" ? "All gateways" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={purpose || "ALL"} onValueChange={(value) => setPurpose(!value || value === "ALL" ? null : value)}>
          <SelectTrigger className="w-36" aria-label="Filter by purpose">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PURPOSES.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "ALL" ? "All purposes" : option.charAt(0) + option.slice(1).toLowerCase()}
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
            icon={CreditCard}
            title="No payments found"
            description="Adjust the filters to see transactions across the platform."
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
