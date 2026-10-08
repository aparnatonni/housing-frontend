import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, Lock, Rocket, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "NestMate exists to make finding housing — and roommates — transparent, fast and fair for everyone involved.",
  openGraph: {
    title: "About NestMate",
    description:
      "NestMate exists to make finding housing — and roommates — transparent, fast and fair for everyone involved.",
  },
};

const VALUES = [
  {
    icon: Target,
    title: "Transparency",
    text: "Real availability, real pricing and an auditable trail of every application, approval and payment.",
  },
  {
    icon: HeartHandshake,
    title: "Fairness",
    text: "Tenants see honest listings; landlords see serious requests. Both sides keep control of every decision.",
  },
  {
    icon: Lock,
    title: "Security",
    text: "Payments run through SSLCommerz with server-side validation — no cash handoffs, no fake receipts.",
  },
  {
    icon: Rocket,
    title: "Speed",
    text: "Viewing requests, applications and rent invoices move in hours, not weeks of email threads.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Housing search shouldn&apos;t feel like a gamble
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          NestMate is a housing &amp; roommate platform built for the way people actually move:
          tenants compare rooms and roommates, book viewings and apply online — while landlords
          post listings, answer requests and track rent from one dashboard.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <value.icon className="size-4" aria-hidden />
            </span>
            <h2 className="mt-3 font-heading text-lg font-semibold">{value.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{value.text}</p>
          </div>
        ))}
      </div>

      <section className="mt-14 rounded-2xl bg-muted/40 p-6 sm:p-10">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">How we are different</h2>
        <div className="mt-4 grid gap-6 text-sm text-muted-foreground md:grid-cols-3">
          <p>
            <span className="block font-medium text-foreground">One platform, three roles.</span>
            Tenants, landlords and admins share the same source of truth, so nobody re-enters the
            same information twice.
          </p>
          <p>
            <span className="block font-medium text-foreground">Roommates are first-class.</span>
            Tenant profiles carry roommate preferences — budget, city, lifestyle tags — next to
            their applications.
          </p>
          <p>
            <span className="block font-medium text-foreground">Payments you can audit.</span>
            Rent and bill splits are tracked per tenancy, and every admin action lands in an audit
            log.
          </p>
        </div>
        <div className="mt-6">
          <Button render={<Link href="/register" />}>
            Join NestMate <Rocket aria-hidden />
          </Button>
        </div>
      </section>
    </div>
  );
}
