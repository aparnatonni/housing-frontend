import type { Metadata } from "next";
import { ListingWizard } from "@/components/dashboard/provider/listing-wizard";

export const metadata: Metadata = {
  title: "Post a listing",
  description: "Publish a property and its rooms in five short steps.",
};

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Post a listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the property details, amenities and rooms tenants can rent.
        </p>
      </div>
      <ListingWizard />
    </div>
  );
}
