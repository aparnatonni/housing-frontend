import type { Metadata } from "next";
import { EarningsPanel } from "@/components/dashboard/provider/earnings-panel";

export const metadata: Metadata = {
  title: "Earnings",
  description: "Track collected rent, outstanding invoices and generate monthly rent bills.",
};

export default function EarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rent collected through SSLCommerz and offline payments on your active tenancies.
        </p>
      </div>
      <EarningsPanel />
    </div>
  );
}
