import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: { default: "Admin dashboard", template: "%s · Admin · NestMate" },
  description: "Platform analytics, user and listing moderation, audit reports.",
  robots: { index: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardShell role="ADMIN" title="Admin dashboard">
        {children}
      </DashboardShell>
    </Suspense>
  );
}
