import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CreditCard,
  KeyRound,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listings/listing-card";
import { HeroSearch } from "@/components/listings/hero-search";
import { CardGridSkeleton } from "@/components/skeletons";
import { serverFetch } from "@/lib/api";
import type { Paginated, PropertySummary } from "@/lib/types";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "NestMate — Find rooms, roommates & homes",
  description:
    "NestMate is the housing & roommate platform where tenants search verified listings, book viewings, apply online and pay rent — and landlords post properties and manage requests.",
  openGraph: {
    title: "NestMate — Find rooms, roommates & homes",
    description:
      "Search verified rooms and homes, match with roommates, book viewings and pay rent securely.",
    type: "website",
  },
};

const STEPS = [
  {
    icon: Search,
    title: "Search & compare",
    text: "Filter rooms, studios and whole homes by city, budget, property type and availability.",
  },
  {
    icon: CalendarCheck,
    title: "Book a viewing",
    text: "Send a viewing request with your preferred date. Landlords approve or propose a new time.",
  },
  {
    icon: KeyRound,
    title: "Apply & move in",
    text: "Apply online, get approved, sign your tenancy and track everything from your dashboard.",
  },
  {
    icon: CreditCard,
    title: "Pay securely",
    text: "Pay rent and shared bills through SSLCommerz with an instant, auditable receipt.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I found a roommates-compatible studio in Manhattan in four days. The viewing request and application flow kept me updated at every step.",
    name: "Carol T.",
    role: "Tenant · New York",
  },
  {
    quote:
      "Posting rooms takes minutes and I approve or reject requests from my phone. The earnings view finally made my rental income legible.",
    name: "Alice O.",
    role: "Landlord · Seattle",
  },
  {
    quote:
      "As a frequent mover, having payments, maintenance requests and my profile in one place saved me weeks of back-and-forth email.",
    name: "Devon R.",
    role: "Tenant · Chicago",
  },
];

async function FeaturedListings() {
  let properties: PropertySummary[] = [];
  let failed = false;

  try {
    const data = await serverFetch<Paginated<PropertySummary>>(
      "/properties?limit=6&sortBy=newest"
    );
    properties = data.items;
  } catch {
    failed = true;
  }

  if (failed || properties.length === 0) {
    return (
      <EmptyState
        title={failed ? "Listings are waking up" : "No listings yet"}
        description={
          failed
            ? "The listing API is starting up (cold start). Refresh in a few seconds, or browse all listings."
            : "Be the first — landlords can post a property from their dashboard."
        }
        action={{ label: "Browse listings", href: "/listings" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <ListingCard key={property.id} property={property} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:py-24">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden />
            Housing &amp; roommate platform
          </p>
          <h1 className="max-w-2xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Find your next home — and the right roommate — in one place
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            NestMate connects tenants and landlords with verified listings, viewing requests,
            applications and secure rent payments.
          </p>
          <HeroSearch />
          <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" aria-hidden /> Verified landlords
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-primary" aria-hidden /> Real availability
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4 text-primary" aria-hidden /> Roommate preferences
            </span>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Featured listings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fresh rooms, studios and homes from live listings.
            </p>
          </div>
          <Button variant="outline" size="sm" render={<Link href="/listings" />}>
            View all <ArrowRight aria-hidden />
          </Button>
        </div>
        <Suspense fallback={<CardGridSkeleton count={6} />}>
          <FeaturedListings />
        </Suspense>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Four steps from search to keys — for tenants. Landlords manage everything from one
            dashboard.
          </p>
          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <step.icon className="size-4" aria-hidden />
                </span>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  Step {index + 1}
                </p>
                <h3 className="font-heading text-base font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-14 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-5" aria-hidden />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold">For tenants</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· Search by city, budget, type and roommate-friendliness</li>
            <li>· Book viewings and apply online with move-in dates</li>
            <li>· Track applications, tenancy and maintenance in one place</li>
            <li>· Pay rent and split bills securely with instant receipts</li>
          </ul>
          <Button className="mt-5" render={<Link href="/register" />}>
            Create a tenant account
          </Button>
        </div>
        <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-5" aria-hidden />
          </span>
          <h2 className="mt-4 font-heading text-xl font-semibold">For landlords</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· Post a property with rooms, amenities and photos in minutes</li>
            <li>· Approve or reject viewing requests and applications</li>
            <li>· Generate rent invoices and track earnings</li>
            <li>· Handle maintenance requests per property</li>
          </ul>
          <Button className="mt-5" variant="outline" render={<Link href="/register" />}>
            Start listing properties
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Loved by tenants and landlords
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <figure key={item.name} className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
                <blockquote className="text-sm text-foreground">“{item.quote}”</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="block text-xs text-muted-foreground">{item.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Ready to find your next place?
            </h2>
            <p className="mt-1 max-w-xl text-sm opacity-90">
              Join NestMate today — search live listings, book viewings and pay rent securely.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-background text-foreground hover:bg-background/90"
              render={<Link href="/listings" />}
            >
              Browse listings
            </Button>
            <Button
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              render={<Link href="/register" />}
            >
              Sign up free
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
