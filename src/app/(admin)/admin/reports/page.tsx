import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminReports } from "@/components/dashboard/admin/admin-reports";
import { TableSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "Reports",
  description: "Audit logs and payment volume by gateway for compliance review.",
};

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Audit trail of every important action plus payment volume per gateway.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <AdminReports />
      </Suspense>
    </div>
  );
}
