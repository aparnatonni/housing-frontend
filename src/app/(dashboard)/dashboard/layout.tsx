import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = {
  title: { default: "My dashboard", template: "%s · Tenant dashboard · NestMate" },
  description: "Manage your applications, viewing requests, payments and profile.",
  robots: { index: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell role="TENANT" title="Tenant dashboard">
      {children}
    </DashboardShell>
  );
}
