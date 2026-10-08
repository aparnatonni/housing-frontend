import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = {
  title: { default: "Admin dashboard", template: "%s · Admin · NestMate" },
  description: "Platform analytics, user and listing moderation, audit reports.",
  robots: { index: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell role="ADMIN" title="Admin dashboard">
      {children}
    </DashboardShell>
  );
}
