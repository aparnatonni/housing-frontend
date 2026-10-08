import type { Metadata } from "next";
import { AdminOverview } from "@/components/dashboard/admin/admin-overview";

export const metadata: Metadata = {
  title: "Admin overview",
  description: "Platform-wide counts, revenue and quick links to management tools.",
};

export default function AdminPage() {
  return <AdminOverview />;
}
