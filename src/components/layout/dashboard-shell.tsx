"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogOut, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageSkeleton } from "@/components/skeletons";
import { useAuth, useSessionQuery } from "@/hooks/use-auth";
import { useAuthStore, useHasHydrated } from "@/lib/auth-store";
import { useTheme } from "@/providers/theme-provider";
import { ROLE_LABEL, ROLE_NAV, ROLE_HOME_PATH, isNavActive, type NavLink } from "@/components/layout/nav-config";
import { cn } from "cn";

/**
 * Role-based app shell shared by /dashboard, /provider and /admin.
 * Verifies the persisted session against /auth/me and bounces
 * unauthenticated or wrongly-roled users (middleware does the first pass).
 */
export function DashboardShell({
  role,
  title,
  children,
}: {
  role: "TENANT" | "OWNER" | "ADMIN";
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHasHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  const sessionQuery = useSessionQuery({ enabled: hydrated && Boolean(accessToken) });

  const redirecting = React.useRef(false);
  React.useEffect(() => {
    if (!hydrated || redirecting.current) return;
    if (!accessToken) {
      redirecting.current = true;
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user && user.role !== role) {
      redirecting.current = true;
      router.replace(ROLE_HOME_PATH[user.role]);
    }
  }, [hydrated, accessToken, user, role, pathname, router]);

  if (!hydrated || (accessToken && !user) || (accessToken && user?.role !== role)) {
    return <PageSkeleton />;
  }

  if (sessionQuery.isError && !user) return <PageSkeleton />;

  const nav = ROLE_NAV[role];

  return (
    <div className="flex min-h-dvh w-full">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-muted/20 lg:flex">
        <SidebarContent
          nav={nav}
          pathname={pathname}
          role={role}
          onNavigate={() => undefined}
          user={user ? { name: user.name, email: user.email, avatarUrl: user.avatarUrl } : null}
          onLogout={() => void logout()}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="fixed top-3 left-3 z-40 bg-background shadow-sm ring-1 ring-border lg:hidden"
              aria-label="Open navigation"
            />
          }
        >
          <Menu aria-hidden />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            nav={nav}
            pathname={pathname}
            role={role}
            onNavigate={() => setOpen(false)}
            user={user ? { name: user.name, email: user.email, avatarUrl: user.avatarUrl } : null}
            onLogout={() => {
              setOpen(false);
              void logout();
            }}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:justify-end">
          <p className="pl-10 font-heading text-sm font-semibold lg:pl-0 lg:text-base">{title}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
            </Button>
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
                  <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name ?? "User"} />
                  <AvatarFallback>
                    {(user?.name ?? "?")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <span className="block truncate text-sm font-medium">{user?.name}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-primary">
                    {ROLE_LABEL[role]} account
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toggleTheme()}>
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href={role === "TENANT" ? "/listings" : "/"} />}>
                  Back to site
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void logout()}>
                  <LogOut aria-hidden />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  nav,
  pathname,
  role,
  onNavigate,
  user,
  onLogout,
  theme,
  onToggleTheme,
}: {
  nav: NavLink[];
  pathname: string;
  role: "TENANT" | "OWNER" | "ADMIN";
  onNavigate: () => void;
  user: { name: string; email: string; avatarUrl: string | null } | null;
  onLogout: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-sm font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="size-3.5" aria-hidden />
          </span>
          NestMate
        </Link>
      </div>
      <nav aria-label={`${ROLE_LABEL[role]} navigation`} className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = isNavActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.name ?? "Signed in"}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onLogout} aria-label="Sign out">
            <LogOut aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
