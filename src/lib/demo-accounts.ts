import type { Role } from "@/lib/types";

export interface DemoAccount {
  role: Role;
  label: string;
  description: string;
  email: string;
  password: string;
  /**
   * TODO(owner): the ADMIN demo account has not been created in the backend yet
   * (see BLOCKERS.md). Until `adminLogin` works against the live API, the Admin
   * demo button will call /auth/login with these values and surface the API error.
   */
  todo?: boolean;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "ADMIN",
    label: "Continue as Admin",
    description: "Platform analytics, users, listings & reports",
    email: "admin@housing.com",
    password: "Password123!",
    todo: true,
  },
  {
    role: "TENANT",
    label: "Continue as Tenant",
    description: "Search homes, book viewings, apply & pay rent",
    email: "tenant1@housing.com",
    password: "Password123!",
  },
  {
    role: "OWNER",
    label: "Continue as Landlord",
    description: "Post listings, manage requests & track earnings",
    email: "owner1@housing.com",
    password: "Password123!",
  },
];
