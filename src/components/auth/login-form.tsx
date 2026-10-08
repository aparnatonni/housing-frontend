"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ShieldCheck, UserRound, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/data-table";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import type { Role } from "@/lib/types";
import { cn } from "cn";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

const DEMO_ICON: Record<Role, React.ElementType> = {
  ADMIN: ShieldCheck,
  TENANT: UserRound,
  OWNER: Building2,
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next");
  const { login, homeFor } = useAuth();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const session = await login(values);
      router.replace(next && next.startsWith("/") ? next : homeFor(session.user.role));
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          if (field in values) {
            form.setError(field as keyof LoginValues, { message: messages[0] });
          }
        }
      }
    }
  };

  const demoLogin = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
    try {
      const session = await login({ email: account.email, password: account.password });
      router.replace(next && next.startsWith("/") ? next : homeFor(session.user.role));
    } catch {
      /* toast already shown by useAuth */
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton
            type="submit"
            className="w-full"
            loading={form.formState.isSubmitting}
          >
            Sign in
          </LoadingButton>
        </form>
      </Form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs tracking-wide text-muted-foreground uppercase">Demo login</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid gap-2">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = DEMO_ICON[account.role];
          return (
            <Button
              key={account.role}
              type="button"
              variant="outline"
              className={cn("h-auto justify-start gap-3 px-3 py-2.5 text-left", account.todo && "opacity-90")}
              onClick={() => demoLogin(account)}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{account.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {account.description}
                </span>
              </span>
            </Button>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}