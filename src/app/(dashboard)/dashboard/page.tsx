import type { Metadata } from "next";
import { Suspense } from "react";
import { TenantOverview } from "@/components/dashboard/tenant/tenant-overview";
import { PageSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "My dashboard",
  description: "Your applications, viewing requests, maintenance tickets and current home.",
};

export default function TenantDashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TenantOverview />
    </Suspense>
  );
}
