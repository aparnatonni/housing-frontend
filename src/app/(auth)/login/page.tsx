import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { FormSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to NestMate to search homes, manage listings, book viewings and pay rent.",
  openGraph: {
    title: "Sign in · NestMate",
    description: "Access your NestMate tenant, landlord or admin dashboard.",
  },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue, or use a one-click demo account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Register
          </a>
        </>
      }
    >
      <Suspense fallback={<FormSkeleton fields={3} />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
