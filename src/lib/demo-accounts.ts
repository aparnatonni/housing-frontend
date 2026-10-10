import type { Role } from "@/lib/types";

export interface DemoAccount {
  role: Role;
  label: string;
  description: string;
  email: string;
  password: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "ADMIN",
    label: "Continue as Admin",
    description: "Platform analytics, users, listings & reports",
    email: "admin@nestmate.com",
    password: "Demo@12345",
  },
  {
    role: "TENANT",
    label: "Continue as Tenant",
    description: "Search homes, book viewings, apply & pay rent",
    email: "tenant@nestmate.com",
    password: "Demo@12345",
  },
  {
    role: "OWNER",
    label: "Continue as Landlord",
    description: "Post listings, manage requests & track earnings",
    email: "landlord@nestmate.com",
    password: "Demo@12345",
  },
];
