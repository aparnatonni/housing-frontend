"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, FileText, Home, Inbox } from "lucide-react";
import { api } from "@/lib/api";
import type { Application, Paginated, ViewingRequest } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import {
  ActiveTenancyCard,
  MyApplications,
  MyMaintenance,
  MyViewingRequests,
  useMyTenancy,
} from "@/components/dashboard/tenant/tenant-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = {
  applications: [
    { value: "ALL", label: "All statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ],
  viewings: [
    { value: "ALL", label: "All statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ],
} as const;

export function TenantOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "applications";
  const status = searchParams.get("status") ?? "";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "ALL") params.delete(key);
    else params.set(key, value);
    if (key !== "tab") params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `/dashboard?${qs}` : "/dashboard", { scroll: false });
  };

  const { data: applications } = useQuery({
    queryKey: ["my-applications", ""],
    queryFn: () => api.get<Paginated<Application>>("/applications/my-applications?limit=50"),
  });

  const { data: viewings } = useQuery({
    queryKey: ["my-viewing-requests", ""],
    queryFn: () => api.get<Paginated<ViewingRequest>>("/viewing-requests/my-requests?limit=50"),
  });

  const pendingApplications =
    applications?.items.filter((item) => item.status === "PENDING").length ?? 0;
  const approvedApplications =
    applications?.items.filter((item) => item.status === "APPROVED").length ?? 0;
  const pendingViewings =
    viewings?.items.filter((item) => item.status === "PENDING").length ?? 0;

  const { data: tenancy } = useMyTenancy();
  const tenancyTitle = tenancy ? tenancy.room?.property.title : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Applications"
          value={applications?.meta.total ?? "—"}
          hint={`${approvedApplications} approved`}
          icon={FileText}
        />
        <StatCard
          label="Awaiting decision"
          value={pendingApplications}
          hint="Applications still pending"
          icon={Inbox}
        />
        <StatCard
          label="Viewing requests"
          value={viewings?.meta.total ?? "—"}
          hint={`${pendingViewings} awaiting reply`}
          icon={CalendarCheck}
        />
        <StatCard
          label="Active tenancy"
          value={tenancyTitle ?? "None"}
          hint="Your current home"
          icon={Home}
        />
      </div>

      <ActiveTenancyCard />

      <Tabs
        value={tab}
        onValueChange={(value) => setParam("tab", value ?? "applications")}
        className="gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="viewings">Viewings</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
          {tab === "maintenance" ? null : (
            <Select
              value={status || "ALL"}
              onValueChange={(value) => setParam("status", value ?? "ALL")}
            >
              <SelectTrigger className="w-44" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(tab === "viewings" ? STATUS_OPTIONS.viewings : STATUS_OPTIONS.applications).map(
                  (option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="applications">
          <MyApplications status={status || undefined} />
        </TabsContent>
        <TabsContent value="viewings">
          <MyViewingRequests status={status || undefined} />
        </TabsContent>
        <TabsContent value="maintenance">
          <MyMaintenance />
        </TabsContent>
      </Tabs>
    </div>
  );
}
