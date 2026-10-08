import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NestMate — Housing & Roommate Platform",
    template: "%s · NestMate",
  },
  description:
    "Find rooms, roommates and whole homes in one place. NestMate connects tenants and landlords with verified listings, viewing requests, applications and secure rent payments.",
  keywords: ["housing", "roommate", "rent", "apartment", "listings", "NestMate"],
  openGraph: {
    type: "website",
    siteName: "NestMate",
    title: "NestMate — Housing & Roommate Platform",
    description:
      "Search verified rooms and homes, match with roommates, book viewings and pay rent securely.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "NestMate — Housing & Roommate Platform",
    description:
      "Search verified rooms and homes, match with roommates, book viewings and pay rent securely.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
