import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  Hammer,
  KeyRound,
  Search,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services",
  description:
    "From verified listings and viewing requests to rent payments, bill splits and maintenance — everything NestMate does for tenants and landlords.",
  openGraph: {
    title: "Services · NestMate",
    description: "Everything NestMate does for tenants and landlords.",
  },
};

const SERVICES = [
  {
    icon: Search,
    title: "Listing discovery",
    text: "Paginated, filterable search across city, budget, property type and keyword — synced to the URL so results are shareable.",
  },
  {
    icon: CalendarCheck,
    title: "Viewing requests",
    text: "Tenants propose a date and notes; landlords approve, reject or complete the viewing from their dashboard.",
  },
  {
    icon: Users,
    title: "Applications & tenancies",
    text: "Online applications with move-in dates. Approving an application frees the room, rejects other pending requests and starts the tenancy.",
  },
  {
    icon: CreditCard,
    title: "Rent & bill payments",
    text: "SSLCommerz checkout for rent and shared bills, with server-side validation and a full payment history for tenants and admins.",
  },
  {
    icon: Wrench,
    title: "Maintenance requests",
    text: "Tenants report issues with photos and priority; landlords progress them from open to resolved and notify tenants automatically.",
  },
  {
    icon: BarChart3,
    title: "Landlord earnings & admin analytics",
    text: "Rent payment history per tenancy, plus platform-wide stats, moderation tools and audit logs for admins.",
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" aria-hidden />
          Services
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything a move takes, in one product
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          NestMate covers the full rental lifecycle — discovery, viewings, applications, payments
          and upkeep — for tenants, landlords and the admins who keep the platform healthy.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <div key={service.title} className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <service.icon className="size-4" aria-hidden />
            </span>
            <h2 className="mt-3 font-heading text-base font-semibold">{service.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{service.text}</p>
          </div>
        ))}
      </div>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-4" aria-hidden />
          </span>
          <h2 className="mt-3 font-heading text-lg font-semibold">Landlord toolkit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-step listing wizard with rooms and amenities, request approvals, rent invoice
            generation, maintenance triage and an earnings view built on real payments.
          </p>
          <Button className="mt-4" variant="outline" size="sm" render={<Link href="/provider" />}>
            Open landlord dashboard
          </Button>
        </div>
        <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Hammer className="size-4" aria-hidden />
          </span>
          <h2 className="mt-3 font-heading text-lg font-semibold">Built on a real API</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every screen reads live data from the NestMate backend — no demo datasets, no fake
            buttons. What you see is what is actually stored.
          </p>
          <Button className="mt-4" variant="outline" size="sm" render={<Link href="/listings" />}>
            Browse live listings
          </Button>
        </div>
      </section>
    </div>
  );
}
