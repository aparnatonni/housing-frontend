"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/data-table";

const SUPPORT_EMAIL = "support@nestmate.app";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  topic: z.string().min(1, "Pick a topic"),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (at least 10 characters)")
    .max(2000, "Keep it under 2000 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

const TOPICS = ["General question", "Tenant support", "Landlord support", "Report a listing"];

export function ContactForm() {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", topic: TOPICS[0], message: "" },
  });

  const onSubmit = (values: ContactValues) => {
    // The backend has no contact endpoint yet (see BLOCKERS.md) — the form
    // hands the message to the visitor's email client so nothing is faked.
    const body = encodeURIComponent(
      `Name: ${values.name}\nEmail: ${values.email}\nTopic: ${values.topic}\n\n${values.message}`
    );
    const subject = encodeURIComponent(`[NestMate] ${values.topic}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app with the message pre-filled.");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                >
                  {TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="How can we help?"
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We usually reply within one business day at {SUPPORT_EMAIL}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton type="submit" loading={form.formState.isSubmitting}>
          <Mail aria-hidden /> Send message
        </LoadingButton>
      </form>
    </Form>
  );
}
