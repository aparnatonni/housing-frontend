import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "@/components/payments/payment-result";
import { PageSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Your SSLCommerz checkout was cancelled — no money was taken.",
  robots: { index: false },
};

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PaymentResult outcome="cancel" />
    </Suspense>
  );
}
