"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Search, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { Payment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

interface LastPayment {
  tranId?: string;
  paymentId?: string;
  purpose?: string;
  type?: string;
  amount?: number;
}

function readLastPayment(): LastPayment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("hh_last_payment");
    return raw ? (JSON.parse(raw) as LastPayment) : null;
  } catch {
    return null;
  }
}

/**
 * Shared result screen for /payment/success and /payment/cancel.
 * Verifies the transaction through GET /payments/:id (payer/owner/admin)
 * rather than trusting the redirect query string.
 */
export function PaymentResult({ outcome }: { outcome: "success" | "cancel" }) {
  const searchParams = useSearchParams();
  const initialId =
    searchParams.get("paymentId") ??
    searchParams.get("payment_id") ??
    searchParams.get("id") ??
    "";
  const tranId = searchParams.get("tran_id") ?? searchParams.get("tranId") ?? "";
  const lastPayment = React.useMemo(() => readLastPayment(), []);

  const [paymentId, setPaymentId] = React.useState(initialId || lastPayment?.paymentId || "");
  const [submittedId, setSubmittedId] = React.useState(initialId || lastPayment?.paymentId || "");

  const { data, isFetching, isError } = useQuery({
    queryKey: ["payment-status", submittedId],
    enabled: Boolean(submittedId),
    retry: false,
    queryFn: () => api.get<Payment>(`/payments/${submittedId}`),
  });

  const paid = data?.status === "SUCCESS" || data?.status === "VALID";
  const isSuccess = outcome === "success";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-6 px-4 py-16">
      <span
        className={
          isSuccess
            ? "flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : "flex size-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400"
        }
      >
        {isSuccess ? <CheckCircle2 className="size-8" aria-hidden /> : <XCircle className="size-8" aria-hidden />}
      </span>

      <div className="text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {isSuccess ? "Payment submitted" : "Payment cancelled"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSuccess
            ? "Thank you! We are confirming the transaction with SSLCommerz."
            : "No money was taken. You can retry the payment whenever you are ready."}
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Transaction</span>
            <span className="font-mono text-xs">{tranId || lastPayment?.tranId || "—"}</span>
          </div>
          {data ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Purpose</span>
                <span>{data.purpose}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 2,
                  }).format(data.amount)}{" "}
                  {data.currency ? data.currency.toUpperCase() : ""}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Gateway status</span>
                <StatusBadge status={data.status} />
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              {isFetching
                ? "Verifying the transaction…"
                : "We have not verified a transaction yet — enter your payment ID below."}
            </p>
          )}
          {isFetching ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden /> Checking with the API…
            </p>
          ) : null}
          {isError ? (
            <p className="text-xs text-destructive">
              We could not find that payment. Double-check the ID from your receipts.
            </p>
          ) : null}
          {paid ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Confirmed — your account has been updated.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <form
        className="flex w-full items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedId(paymentId.trim());
        }}
      >
        <Input
          value={paymentId}
          onChange={(event) => setPaymentId(event.target.value)}
          placeholder="Paste a payment ID to verify"
          aria-label="Payment ID"
        />
        <Button type="submit" variant="outline" disabled={!paymentId.trim() || isFetching}>
          <Search aria-hidden /> Verify
        </Button>
      </form>

      <div className="flex flex-wrap justify-center gap-2">
        <Button render={<Link href="/dashboard/payments" />}>Go to my payments</Button>
        {!isSuccess ? (
          <Button variant="outline" render={<Link href="/dashboard/payments" />}>
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
