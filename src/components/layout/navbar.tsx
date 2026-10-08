"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "cn";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, homeFor } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  const dashboardHref = homeFor(user?.role);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="size-4" aria-hidden />
            </span>
            NestMate
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                  pathname === link.href ? "text-foreground" : "text-muted-foreground"
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
          </Button>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="outline" size="sm" render={<Link href={dashboardHref} />}>
                Dashboard
              </Button>
              <UserMenu email={user?.email ?? ""} name={user?.name ?? ""} avatarUrl={user?.avatarUrl ?? null} onLogout={logout} />
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button size="sm" render={<Link href="/register" />}>
                Get started
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open menu" />
              }
            >
              <Menu aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" className="flex w-72 flex-col gap-0 p-0">
              <SheetHeader className="border-b border-border px-4 py-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted",
                      pathname === link.href ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <Separator />
              <div className="flex flex-col gap-2 p-3">
                {isAuthenticated ? (
                  <>
                    <Button size="sm" render={<Link href={dashboardHref} onClick={() => setOpen(false)} />}>
                      Go to dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOpen(false);
                        void logout();
                      }}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" render={<Link href="/login" onClick={() => setOpen(false)} />}>
                      Sign in
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href="/register" onClick={() => setOpen(false)} />}
                    >
                      Create account
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function UserMenu({
  name,
  email,
  avatarUrl,
  onLogout,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Account menu"
            className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <Avatar className="size-8">
          <AvatarImage src={avatarUrl ?? undefined} alt={name} />
          <AvatarFallback>
            {name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">
          <span className="block truncate text-sm font-medium">{name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/profile" />}>My profile</DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
