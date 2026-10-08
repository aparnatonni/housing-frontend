import type { Metadata } from "next";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUsers } from "@/components/dashboard/admin/admin-users";
import { AdminListings } from "@/components/dashboard/admin/admin-listings";
import { AdminPayments } from "@/components/dashboard/admin/admin-payments";
import { TableSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "Manage platform",
  description: "Suspend users, deactivate listings and audit payments across the platform.",
};

export default function AdminManagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Manage platform</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Users, listings and every payment flowing through the platform.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <Tabs defaultValue="users" className="gap-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
          <TabsContent value="listings">
            <AdminListings />
          </TabsContent>
          <TabsContent value="payments">
            <AdminPayments />
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  );
}
