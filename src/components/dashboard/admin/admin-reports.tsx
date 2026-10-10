"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { AuditLog, Paginated, Payment } from "@/lib/types";
import { DataTable, PaginationBar, type Column } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination, useUrlParam } from "@/hooks/use-pagination";

const ENTITY_TYPES = [
  "ALL",
  "Application",
  "MaintenanceRequest",
  "RentPayment",
  "BillSplit",
  "ViewingRequest",
  "Property",
  "User",
];

export function AdminReports() {
  const [entityType, setEntityType] = useUrlParam("entityType");
  const [from, setFrom] = useUrlParam("from");
  const [to, setTo] = useUrlParam("to");
  const { page, setPage } = usePagination();

  const query = new URLSearchParams({ page: String(page), limit: "20" });
  if (entityType) query.set("entityType", entityType);
  if (from) query.set("from", new Date(from).toISOString());
  if (to) query.set("to", new Date(`${to}T23:59:59`).toISOString());

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["admin-audit-logs", query.toString()],
    queryFn: () => api.get<Paginated<AuditLog>>(`/admin/audit-logs?${query.toString()}`),
  });

  const { data: payments } = useQuery({
    queryKey: ["admin-payments-chart"],
    queryFn: () => api.get<Paginated<Payment>>("/admin/payments?page=1&limit=100"),
  });

  React.useEffect(() => {
    if (isError)
      toast.error(error instanceof ApiError ? error.message : "Could not load audit logs");
  }, [isError, error]);

  const chartData = React.useMemo(() => {
    const buckets = new Map<string, number>();
    for (const payment of payments?.items ?? []) {
      const key = payment.gateway || "OTHER";
      buckets.set(key, (buckets.get(key) ?? 0) + (payment.amount ?? 0));
    }
    return Array.from(buckets.entries()).map(([name, value]) => ({ name, value }));
  }, [payments]);

  const columns: Column<AuditLog>[] = [
    {
      key: "action",
      header: "Action",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{row.action.replaceAll("_", " ")}</p>
          <Badge variant="secondary" className="mt-1">
            {row.entityType}
          </Badge>
        </div>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      cell: (row) => (
        <span className="text-sm">
          {row.user?.name ?? "System"}
          <span className="block text-xs text-muted-foreground">{row.user?.email ?? row.userId ?? "—"}</span>
        </span>
      ),
    },
    {
      key: "entityId",
      header: "Entity",
      cell: (row) => (
        <span className="block max-w-[12rem] truncate font-mono text-xs text-muted-foreground">
          {row.entityId ?? "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "When",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment volume by gateway</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No payments to chart yet.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} width={70} />
                  <Tooltip
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                  />
                  <Bar dataKey="value" name="Amount" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={entityType || "ALL"}
            onValueChange={(value) => setEntityType(!value || value === "ALL" ? null : value)}
          >
            <SelectTrigger className="w-52" aria-label="Filter by entity type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "ALL" ? "All entities" : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label="From date"
              value={from}
              onChange={(event) => setFrom(event.target.value || null)}
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              aria-label="To date"
              value={to}
              onChange={(event) => setTo(event.target.value || null)}
              className="w-40"
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          rowKey={(row) => row.id}
          isLoading={isPending}
          empty={
            <EmptyState
              icon={Activity}
              title="No audit logs"
              description="Activity is recorded as users apply, approve, pay and change statuses."
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
    </div>
  );
}
