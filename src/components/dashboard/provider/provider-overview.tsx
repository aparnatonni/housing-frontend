"use client";

import { Building2, CalendarCheck, DoorOpen, Eye } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyProperties, useReceivedViewings } from "@/components/dashboard/provider/provider-data";
import {
  MyListingsHeader,
  MyListingsTable,
} from "@/components/dashboard/provider/provider-listings";
import {
  PropertyMaintenance,
  ReceivedViewingRequests,
} from "@/components/dashboard/provider/provider-requests";

export function ProviderOverview() {
  const { data: properties } = useMyProperties(1, 50);
  const { data: viewings } = useReceivedViewings();

  const items = properties?.items ?? [];
  const activeListings = items.filter((property) => property.status === "ACTIVE").length;
  const rooms = items.reduce((sum, property) => sum + property.roomCount, 0);
  const pendingViewings = viewings?.items.filter((item) => item.status === "PENDING").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Listings"
          value={properties?.meta.total ?? "—"}
          hint={`${activeListings} published`}
          icon={Building2}
        />
        <StatCard label="Rooms" value={rooms} hint="Across all listings" icon={DoorOpen} />
        <StatCard
          label="Viewing requests"
          value={viewings?.meta.total ?? "—"}
          hint={`${pendingViewings} awaiting reply`}
          icon={CalendarCheck}
        />
        <StatCard
          label="Occupancy"
          value={activeListings === 0 ? "—" : `${items.length ? Math.round((activeListings / items.length) * 100) : 0}%`}
          hint="Published vs total listings"
          icon={Eye}
        />
      </div>

      <Tabs defaultValue="listings" className="gap-4">
        <TabsList>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="viewings">Viewing requests</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="space-y-4">
          <MyListingsHeader />
          <MyListingsTable />
        </TabsContent>
        <TabsContent value="viewings">
          <ReceivedViewingRequests />
        </TabsContent>
        <TabsContent value="maintenance">
          <PropertyMaintenance />
        </TabsContent>
      </Tabs>
    </div>
  );
}
