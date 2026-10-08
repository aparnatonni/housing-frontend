import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about searching listings, viewing requests, applications, rent payments and landlord accounts on NestMate.",
  openGraph: {
    title: "FAQ · NestMate",
    description: "Common questions about using NestMate.",
  },
};

const FAQ_GROUPS = [
  {
    title: "Tenants",
    items: [
      {
        q: "Is searching and applying free for tenants?",
        a: "Yes. Searching listings, sending viewing requests, applying to rooms and paying rent online are all free for tenants.",
      },
      {
        q: "How do viewing requests work?",
        a: "Open any available room and send a viewing request with your preferred date and notes. The landlord approves, rejects or asks you to reschedule — you will see the status in your dashboard.",
      },
      {
        q: "What happens after my application is approved?",
        a: "Approving an application marks the room unavailable, closes other pending applications for that room and creates an active tenancy. Your rent payments and bill splits then appear under Payments.",
      },
      {
        q: "How do I pay rent?",
        a: "Open Payments in your dashboard, pick a due rent payment or bill split and continue to the SSLCommerz checkout. Payments are validated by the gateway before they are marked paid.",
      },
    ],
  },
  {
    title: "Landlords",
    items: [
      {
        q: "How do I post a property?",
        a: "Use the Post a listing wizard in your landlord dashboard: property details, location & pricing, amenities & rules, then photos. You can add rooms with rent and capacity at any time.",
      },
      {
        q: "Can I deactivate a listing?",
        a: "Yes — inactive listings disappear from public search but keep their history, requests and tenancies.",
      },
      {
        q: "How do I get paid?",
        a: "Generate a rent invoice for a tenancy with its due date. Tenants pay it online through SSLCommerz, or you can mark offline payments as paid yourself.",
      },
    ],
  },
  {
    title: "Account & security",
    items: [
      {
        q: "Can I have both tenant and landlord features?",
        a: "Each account has one role — tenant or landlord. You can register a second account with the other role using a different email.",
      },
      {
        q: "Are payments secure?",
        a: "All online payments run through SSLCommerz. The backend re-validates every transaction with the gateway before marking it paid — the frontend never fakes a payment state.",
      },
      {
        q: "How do I change my password?",
        a: "Open your profile page in the dashboard and use the change password section.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Can&apos;t find what you need?{" "}
          <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
            Contact us
          </Link>
          .
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        {FAQ_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="font-heading text-lg font-semibold">{group.title}</h2>
            <div className="mt-4 space-y-3">
              {group.items.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-lg bg-card px-4 py-3 ring-1 ring-foreground/10 open:ring-primary/40"
                >
                  <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center gap-3 rounded-2xl bg-muted/40 px-6 py-8 text-center">
        <h2 className="font-heading text-xl font-semibold">Still have questions?</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Our support team replies within one business day.
        </p>
        <Button render={<Link href="/contact" />}>Contact support</Button>
      </div>
    </div>
  );
}
