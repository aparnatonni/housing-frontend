import type { Metadata } from "next";
import { ProviderProfile } from "@/components/dashboard/provider/provider-profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your landlord profile, public photo and account password.",
};

export default function ProviderProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your contact details current so tenants can reach you.
        </p>
      </div>
      <ProviderProfile />
    </div>
  );
}
