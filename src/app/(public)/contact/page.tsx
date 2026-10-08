import type { Metadata } from "next";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about NestMate? Reach the team — tenant, landlord or listing support.",
  openGraph: {
    title: "Contact NestMate",
    description: "Questions about NestMate? Reach the team.",
  },
};

const CHANNELS = [
  {
    icon: Mail,
    title: "Email",
    text: "support@nestmate.app",
  },
  {
    icon: MessageSquare,
    title: "Response time",
    text: "Within one business day, Mon–Fri.",
  },
  {
    icon: MapPin,
    title: "Coverage",
    text: "Operating in all cities with active listings.",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Get in touch</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Questions about a listing, a payment or your account? Send us a message and the right
            person will reply.
          </p>
          <ul className="mt-8 space-y-4">
            {CHANNELS.map((channel) => (
              <li key={channel.title} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <channel.icon className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-medium">{channel.title}</span>
                  <span className="block text-sm text-muted-foreground">{channel.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10 lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
