import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "@/components/payments/payment-result";
import { PageSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "Payment successful",
  description: "We are confirming your SSLCommerz transaction and updating your balance.",
  robots: { index: false },
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PaymentResult outcome="success" />
    </Suspense>
  );
}
