"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Building2, CreditCard, DoorOpen, Users, Wallet, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminDashboardStats, Role } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/components/skeletons";

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function plural(value: number, word: string): string {
  return `${value} ${word}${value === 1 ? "" : "s"}`;
}

export function AdminOverview() {
  const { data, isPending } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get<AdminDashboardStats>("/admin/dashboard-stats"),
  });

  if (isPending) return <PageSkeleton />;

  const users = data?.users?.total ?? 0;
  const byRole: Partial<Record<Role, number>> = data?.users?.byRole ?? {};
  const totalTenants = byRole.TENANT ?? 0;
  const totalOwners = byRole.OWNER ?? 0;
  const properties = data?.properties ?? { total: 0, active: 0, inactive: 0 };
  const rooms = data?.rooms?.total ?? 0;
  const tenancies = data?.tenancies ?? { total: 0, active: 0 };
  const maintenance = data?.maintenanceRequests ?? {
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
  };
  const payments = data?.payments ?? {
    totalThisMonth: 0,
    amountThisMonth: 0,
    successfulThisMonth: 0,
    successfulAmountThisMonth: 0,
    totalSuccessful: 0,
    totalSuccessfulAmount: 0,
  };

  const chartData = [
    { name: "Tenants", value: totalTenants },
    { name: "Landlords", value: totalOwners },
    { name: "Admins", value: byRole.ADMIN ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={users} hint={plural(totalTenants, "tenant")} icon={Users} />
        <StatCard
          label="Properties"
          value={properties.total ?? 0}
          hint={plural(properties.active ?? 0, "active")}
          icon={Building2}
        />
        <StatCard
          label="Payments"
          value={payments.totalSuccessful ?? 0}
          hint={plural(payments.totalThisMonth ?? 0, "this month")}
          icon={CreditCard}
        />
        <StatCard
          label="Revenue"
          value={currency(payments.totalSuccessfulAmount ?? 0)}
          hint="Validated payments"
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Rooms" value={rooms} hint={`${plural(data?.rooms?.available ?? 0, "available")}`} />
        <StatCard
          label="Tenancies"
          value={tenancies.total ?? 0}
          hint={plural(tenancies.active ?? 0, "active")}
          icon={DoorOpen}
        />
        <StatCard
          label="Open issues"
          value={(maintenance.open ?? 0) + (maintenance.inProgress ?? 0)}
          hint={`${maintenance.total ?? 0} total maintenance`}
          icon={Wrench}
        />
        <StatCard
          label="Overdue rent"
          value={data?.rentPayments?.overdue ?? 0}
          hint={`${data?.billSplits?.pending ?? 0} pending bill splits`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users by role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={60} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                  }}
                />
                <Bar dataKey="value" name="Accounts" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage users &amp; listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Suspend accounts, hide listings and audit platform payments.
            </p>
            <Button size="sm" render={<Link href="/admin/manage" />}>
              Open manage
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Review audit logs and payment activity by gateway and purpose.
            </p>
            <Button size="sm" variant="outline" render={<Link href="/admin/reports" />}>
              View reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}