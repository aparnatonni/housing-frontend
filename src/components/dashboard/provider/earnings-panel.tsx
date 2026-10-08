"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Banknote, CalendarPlus, Landmark, Receipt, TrendingUp } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type {
  Paginated,
  PropertySummary,
  RentPayment,
  RentPaymentsResponse,
  Tenancy,
} from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { DataTable, LoadingButton, type Column } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDate, formatMoney } from "@/components/dashboard/provider/provider-data";

interface TenancyWithProperty {
  tenancy: Tenancy;
  propertyTitle: string;
}

interface EarningsRow {
  payment: RentPayment;
  tenancyId: string;
  propertyTitle: string;
}

interface EarningsData {
  rows: EarningsRow[];
  tenancies: TenancyWithProperty[];
}

function firstOfNextMonth(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toISOString().slice(0, 10);
}

async function fetchEarnings(): Promise<EarningsData> {
  const properties = await api.get<Paginated<PropertySummary>>(
    "/properties/my-properties?page=1&limit=50"
  );

  const rows: EarningsRow[] = [];
  const tenancies: TenancyWithProperty[] = [];

  for (const property of properties.items) {
    let tenancyPage: Paginated<Tenancy>;
    try {
      tenancyPage = await api.get<Paginated<Tenancy>>(`/tenancies/${property.id}?page=1&limit=50`);
    } catch {
      continue;
    }
    for (const tenancy of tenancyPage.items) {
      tenancies.push({ tenancy, propertyTitle: property.title });
      try {
        const payments = await api.get<RentPaymentsResponse>(
          `/tenancies/${tenancy.id}/rent-payments`
        );
        for (const payment of [...payments.upcoming, ...payments.history]) {
          rows.push({
            payment,
            tenancyId: tenancy.id,
            propertyTitle: property.title,
          });
        }
      } catch {
        continue;
      }
    }
  }

  rows.sort((a, b) => new Date(b.payment.dueDate).getTime() - new Date(a.payment.dueDate).getTime());
  return { rows, tenancies };
}

function buildMonthlySeries(rows: EarningsRow[]): { month: string; collected: number; due: number }[] {
  const buckets = new Map<string, { collected: number; due: number }>();
  for (const row of rows) {
    const date = new Date(row.payment.paidAt ?? row.payment.dueDate);
    const key = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const bucket = buckets.get(key) ?? { collected: 0, due: 0 };
    if (row.payment.status === "PAID") bucket.collected += row.payment.amount;
    else bucket.due += row.payment.amount;
    buckets.set(key, bucket);
  }
  return Array.from(buckets.entries())
    .map(([month, value]) => ({ month, ...value }))
    .reverse()
    .slice(-6);
}

export function EarningsPanel() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["earnings"],
    queryFn: fetchEarnings,
  });
  const [generateFor, setGenerateFor] = React.useState<TenancyWithProperty | null>(null);
  const [dueDate, setDueDate] = React.useState(firstOfNextMonth());

  React.useEffect(() => {
    if (isError) toast.error(error instanceof ApiError ? error.message : "Could not load earnings");
  }, [isError, error]);

  const markPaid = useMutation({
    mutationFn: (id: string) => api.post(`/rent-payments/${id}/mark-paid`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["earnings"] });
      const previous = queryClient.getQueryData<EarningsData>(["earnings"]);
      if (previous) {
        queryClient.setQueryData<EarningsData>(["earnings"], {
          ...previous,
          rows: previous.rows.map((row) =>
            row.payment.id === id
              ? { ...row, payment: { ...row.payment, status: "PAID", paidAt: new Date().toISOString() } }
              : row
          ),
        });
      }
      return { previous };
    },
    onError: (mutationError, _id, context) => {
      if (context?.previous) queryClient.setQueryData(["earnings"], context.previous);
      toast.error(mutationError instanceof ApiError ? mutationError.message : "Could not mark paid");
    },
    onSuccess: () => toast.success("Rent payment marked as paid"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["earnings"] }),
  });

  const generate = useMutation({
    mutationFn: ({ tenancyId, date }: { tenancyId: string; date: string }) =>
      api.post(`/tenancies/${tenancyId}/rent-payments/generate`, {
        dueDate: new Date(date).toISOString(),
      }),
    onSuccess: () => {
      toast.success("Rent invoice generated");
      setGenerateFor(null);
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof ApiError ? mutationError.message : "Could not generate");
    },
  });

  const rows = data?.rows ?? [];
  const chartData = buildMonthlySeries(rows);
  const collected = rows
    .filter((row) => row.payment.status === "PAID")
    .reduce((sum, row) => sum + row.payment.amount, 0);
  const outstanding = rows
    .filter((row) => row.payment.status !== "PAID")
    .reduce((sum, row) => sum + row.payment.amount, 0);
  const activeTenancies = data?.tenancies.filter((item) => item.tenancy.status === "ACTIVE") ?? [];

  const paymentColumns: Column<EarningsRow>[] = [
    {
      key: "period",
      header: "Rent due",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{formatMoney(row.payment.amount)}</p>
          <p className="text-xs text-muted-foreground">
            Due {formatDate(row.payment.dueDate)}
            {row.payment.paidAt ? ` · paid ${formatDate(row.payment.paidAt)}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "property",
      header: "Property",
      cell: (row) => <span className="text-sm">{row.propertyTitle}</span>,
    },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.payment.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) =>
        row.payment.status === "PAID" ? null : (
          <LoadingButton
            size="xs"
            variant="outline"
            loading={markPaid.isPending && markPaid.variables === row.payment.id}
            onClick={() => markPaid.mutate(row.payment.id)}
          >
            Mark paid
          </LoadingButton>
        ),
    },
  ];

  const tenancyColumns: Column<TenancyWithProperty>[] = [
    {
      key: "property",
      header: "Property",
      cell: ({ tenancy, propertyTitle }) => (
        <div>
          <p className="text-sm font-medium">{propertyTitle}</p>
          <p className="text-xs text-muted-foreground">
            {tenancy.room?.roomType ?? "Room"} · started {formatDate(tenancy.startDate)}
          </p>
        </div>
      ),
    },
    {
      key: "rent",
      header: "Rent",
      cell: ({ tenancy }) => (
        <span className="text-sm font-medium">{formatMoney(tenancy.rentAmount)}</span>
      ),
    },
    { key: "status", header: "Status", cell: ({ tenancy }) => <StatusBadge status={tenancy.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (item) => (
        <Button
          size="xs"
          variant="outline"
          disabled={item.tenancy.status !== "ACTIVE"}
          onClick={() => {
            setDueDate(firstOfNextMonth());
            setGenerateFor(item);
          }}
        >
          <CalendarPlus aria-hidden /> Invoice
        </Button>
      ),
    },
  ];

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (data && data.tenancies.length === 0) {
    return (
      <EmptyState
        icon={Landmark}
        title="No tenancies yet"
        description="Once a tenant's application is approved and a tenancy starts, your rent roll and earnings appear here."
        action={{ label: "Manage listings", href: "/provider" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Collected" value={formatMoney(collected)} hint="All paid rent" icon={Banknote} />
        <StatCard
          label="Outstanding"
          value={formatMoney(outstanding)}
          hint="Due or overdue"
          icon={Receipt}
        />
        <StatCard
          label="Active tenancies"
          value={activeTenancies.length}
          hint="Currently renting"
          icon={TrendingUp}
        />
        <StatCard
          label="Monthly rent roll"
          value={formatMoney(activeTenancies.reduce((sum, item) => sum + item.tenancy.rentAmount, 0))}
          hint="Expected per month"
          icon={Landmark}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collected vs outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No rent invoices yet — generate one from the tenancy list below.
            </p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} width={60} />
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value))}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                  />
                  <Bar dataKey="collected" name="Collected" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="due" name="Outstanding" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Rent invoices</h2>
        <DataTable
          columns={paymentColumns}
          rows={rows}
          rowKey={(row) => row.payment.id}
          empty={
            <EmptyState
              icon={Receipt}
              title="No rent invoices"
              description="Generate an invoice from the tenancy list below to start tracking rent."
            />
          }
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Active tenancies</h2>
        <DataTable
          columns={tenancyColumns}
          rows={data?.tenancies ?? []}
          rowKey={(item) => item.tenancy.id}
          empty={
            <EmptyState
              icon={Landmark}
              title="No tenancies"
              description="Approved applications create tenancies automatically."
            />
          }
        />
      </div>

      <Dialog open={generateFor !== null} onOpenChange={(open) => !open && setGenerateFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate a rent invoice</DialogTitle>
            <DialogDescription>
              Create the monthly rent invoice for {generateFor?.propertyTitle} ({formatMoney(
                generateFor?.tenancy.rentAmount ?? 0
              )}
              ). Duplicate months are rejected by the API.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="due-date" className="text-sm font-medium">
              Due date
            </label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateFor(null)}>
              Cancel
            </Button>
            <LoadingButton
              loading={generate.isPending}
              disabled={!dueDate}
              onClick={() =>
                generateFor && generate.mutate({ tenancyId: generateFor.tenancy.id, date: dueDate })
              }
            >
              Generate invoice
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
