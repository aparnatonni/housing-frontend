import {
  LayoutDashboard,
  UserRound,
  Wallet,
  Building2,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  Users,
  FileWarning,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
}

export const ROLE_NAV: Record<Role, NavLink[]> = {
  TENANT: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/listings", label: "Find a home", icon: Search },
    { href: "/dashboard/payments", label: "Payments", icon: Wallet },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  OWNER: [
    { href: "/provider", label: "My listings", icon: LayoutDashboard },
    { href: "/provider/new", label: "Post a listing", icon: PlusCircle },
    { href: "/provider/earnings", label: "Earnings", icon: TrendingUp },
    { href: "/provider/profile", label: "Profile", icon: UserRound },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", icon: ShieldCheck },
    { href: "/admin/manage", label: "Manage", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: FileWarning },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  TENANT: "Tenant",
  OWNER: "Landlord",
  ADMIN: "Admin",
};

export const ROLE_HOME_PATH: Record<Role, string> = {
  TENANT: "/dashboard",
  OWNER: "/provider",
  ADMIN: "/admin",
};

export function isNavActive(href: string, pathname: string): boolean {
  if (href === "/listings") return pathname.startsWith("/listings");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const PROPERTY_ICONS: Record<string, LucideIcon> = {
  APARTMENT: Building2,
};
