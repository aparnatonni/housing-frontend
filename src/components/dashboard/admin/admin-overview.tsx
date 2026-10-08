"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, CreditCard, Users, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminDashboardStats } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/components/skeletons";

function prettifyKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export function AdminOverview() {
  const { data, isPending } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get<AdminDashboardStats>("/admin/dashboard-stats"),
  });

  if (isPending) return <PageSkeleton />;

  const users = data?.totalUsers ?? data?.users ?? 0;
  const properties = data?.totalProperties ?? data?.properties ?? 0;
  const payments = data?.payments ?? data?.totalPayments ?? 0;
  const revenue = data?.totalRevenue ?? data?.revenue ?? 0;

  const chartData = Object.entries(data ?? {})
    .filter(([, value]) => typeof value === "number")
    .map(([key, value]) => ({ name: prettifyKey(key), value: value as number }))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={users} hint="Tenants, landlords and admins" icon={Users} />
        <StatCard label="Properties" value={properties} hint="Listings on the platform" icon={Building2} />
        <StatCard label="Payments" value={payments} hint="Transactions processed" icon={CreditCard} />
        <StatCard
          label="Revenue"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(revenue)}
          hint="Validated payments"
          icon={Wallet}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform totals</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No aggregate metrics were returned by the API.
            </p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} width={60} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                  />
                  <Bar dataKey="value" name="Total" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
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
