import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: { default: "Landlord dashboard", template: "%s · Landlord dashboard · NestMate" },
  description: "Post listings, handle viewing requests and applications, track earnings.",
  robots: { index: false },
};

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardShell role="OWNER" title="Landlord dashboard">
        {children}
      </DashboardShell>
    </Suspense>
  );
}
