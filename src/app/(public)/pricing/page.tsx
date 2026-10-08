import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "NestMate is free for tenants. Landlords list rooms free and upgrade for unlimited listings, priority placement and advanced earnings reports.",
  openGraph: {
    title: "Pricing · NestMate",
    description: "Free for tenants. Simple plans for landlords.",
  },
};

const PLANS = [
  {
    name: "Tenant",
    price: "Free",
    tagline: "For anyone searching for a home or roommate.",
    features: [
      "Unlimited listing search & filters",
      "Viewing requests and applications",
      "Rent & bill payments via SSLCommerz",
      "Profile with roommate preferences",
      "Maintenance requests",
    ],
    cta: "Create free account",
    highlighted: false,
  },
  {
    name: "Landlord Starter",
    price: "$0",
    tagline: "Post your first rooms and handle requests.",
    features: [
      "Up to 3 active listings",
      "Viewing request & application inbox",
      "Rent invoice generation",
      "Maintenance triage per property",
      "Earnings history",
    ],
    cta: "Start listing",
    highlighted: true,
  },
  {
    name: "Landlord Pro",
    price: "$29",
    period: "/month",
    tagline: "For landlords running several properties.",
    features: [
      "Unlimited active listings",
      "Priority placement in search",
      "Advanced earnings analytics",
      "Bill split tools for roommates",
      "Priority support",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple, honest pricing
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Tenants always search and apply for free. Landlords pay only when their portfolio grows.
        </p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={
              plan.highlighted
                ? "flex flex-col rounded-2xl bg-primary p-6 text-primary-foreground ring-1 ring-primary"
                : "flex flex-col rounded-2xl bg-card p-6 ring-1 ring-foreground/10"
            }
          >
            <h2 className="font-heading text-lg font-semibold">{plan.name}</h2>
            <p className={plan.highlighted ? "mt-1 text-sm opacity-90" : "mt-1 text-sm text-muted-foreground"}>
              {plan.tagline}
            </p>
            <p className="mt-5 font-heading text-4xl font-semibold tracking-tight">
              {plan.price}
              {plan.period ? (
                <span className="text-base font-normal opacity-80">{plan.period}</span>
              ) : null}
            </p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6"
              variant={plan.highlighted ? "secondary" : "default"}
              render={<Link href="/register" />}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Payment processing is billed by SSLCommerz at standard gateway rates. Cancel Landlord Pro
        any time.
      </p>
    </div>
  );
}
