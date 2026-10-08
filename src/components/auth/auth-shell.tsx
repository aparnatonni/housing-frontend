import * as React from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { cn } from "cn";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 px-4 py-10"
    >
      <div className={cn("w-full max-w-md", className)}>
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="size-4" aria-hidden />
          </span>
          NestMate
        </Link>
        <div className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-foreground/10 sm:p-8">
          <h1 className="font-heading text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer ? <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </main>
  );
}
