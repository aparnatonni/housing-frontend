import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { FormSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Join NestMate as a tenant looking for a home or as a landlord listing properties.",
  openGraph: {
    title: "Create account · NestMate",
    description: "Join NestMate as a tenant looking for a home or as a landlord listing properties.",
  },
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes less than a minute. Tenants search free; landlords post listings."
    >
      <Suspense fallback={<FormSkeleton fields={5} />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
