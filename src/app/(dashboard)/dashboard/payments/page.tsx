import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BillSplitsPanel,
  PaymentHistoryPanel,
  RentPaymentsPanel,
} from "@/components/dashboard/tenant/payments-panel";

export const metadata: Metadata = {
  title: "Payments",
  description: "Rent invoices, shared bills and your full payment history via SSLCommerz.",
};

export default function TenantPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pay rent and shared bills through SSLCommerz. Every transaction is validated by the
          gateway before it is marked paid.
        </p>
      </div>
      <Tabs defaultValue="rent" className="gap-4">
        <TabsList>
          <TabsTrigger value="rent">Rent</TabsTrigger>
          <TabsTrigger value="bills">Shared bills</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="rent">
          <RentPaymentsPanel />
        </TabsContent>
        <TabsContent value="bills">
          <BillSplitsPanel />
        </TabsContent>
        <TabsContent value="history">
          <PaymentHistoryPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
