import type { Metadata } from "next";
import { ProviderOverview } from "@/components/dashboard/provider/provider-overview";

export const metadata: Metadata = {
  title: "My listings",
  description: "Manage your property listings, viewing requests and maintenance tickets.",
};

export default function ProviderDashboardPage() {
  return <ProviderOverview />;
}
