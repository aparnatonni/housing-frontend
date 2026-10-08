import { NextRequest, NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  OWNER: "/provider",
  TENANT: "/dashboard",
};

const PUBLIC_MATCHER = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const role = request.cookies.get("hh_role")?.value ?? null;

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/provider");

  // Logged-in users should not sit on the auth pages.
  if (
    !isProtected &&
    PUBLIC_MATCHER.includes(pathname) &&
    role &&
    role in ROLE_HOME
  ) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/dashboard", request.url));
  }

  if (!isProtected) return NextResponse.next();

  if (!role || !(role in ROLE_HOME)) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/login") loginUrl.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("hh_role");
    response.cookies.delete("hh_uid");
    return response;
  }

  // Each role only gets its own area (role-based route protection).
  const home = ROLE_HOME[role];
  if (!pathname.startsWith(home)) {
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect dashboards; skip API routes and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
