import Link from "next/link";
import { Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/listings", label: "Browse listings" },
      { href: "/services", label: "Services" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About us" },
    ],
  },
  {
    title: "For tenants",
    links: [
      { href: "/register", label: "Create an account" },
      { href: "/dashboard", label: "My applications" },
      { href: "/dashboard/payments", label: "Rent payments" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "For landlords",
    links: [
      { href: "/provider", label: "Landlord dashboard" },
      { href: "/provider/new", label: "Post a listing" },
      { href: "/provider/earnings", label: "Earnings" },
      { href: "/pricing", label: "Pricing plans" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/about", label: "About" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-heading text-base font-semibold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Home className="size-3.5" aria-hidden />
              </span>
              NestMate
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Housing &amp; roommate platform connecting tenants and landlords — search, apply,
              book viewings and pay rent in one place.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NestMate. All rights reserved.</p>
          <p>Built with Next.js, powered by the NestMate API.</p>
        </div>
      </div>
    </footer>
  );
}
