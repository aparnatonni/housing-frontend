import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = {
  title: { default: "Landlord dashboard", template: "%s · Landlord dashboard · NestMate" },
  description: "Post listings, handle viewing requests and applications, track earnings.",
  robots: { index: false },
};

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell role="OWNER" title="Landlord dashboard">
      {children}
    </DashboardShell>
  );
}
