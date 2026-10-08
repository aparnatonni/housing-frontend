import type { Metadata } from "next";
import { ProfileForm } from "@/components/dashboard/tenant/profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your personal details, profile photo and roommate preferences.",
};

export default function TenantProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Landlords see your name, phone, photo and bio when you apply.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
