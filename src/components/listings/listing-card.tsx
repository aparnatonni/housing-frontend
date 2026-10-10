import Link from "next/link";
import { BedDouble, MapPin, Users } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { Badge } from "@/components/ui/badge";
import type { PropertySummary } from "@/lib/types";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ListingCard({ property }: { property: PropertySummary }) {
  const hasRooms = property.roomCount > 0 && property.minRent !== null;
  return (
    <Link
      href={`/listings/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <SafeImage
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
          {property.propertyType}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold leading-snug group-hover:text-primary">
            {property.title}
          </h3>
          {hasRooms ? (
            <p className="shrink-0 font-heading text-base font-semibold text-primary">
              {formatPrice(property.minRent!)}
              <span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
          ) : (
            <p className="shrink-0 text-xs font-medium text-muted-foreground">
              No rooms available yet
            </p>
          )}
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {property.area ? `${property.area}, ` : ""}
          {property.city}, {property.state}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="size-3.5" aria-hidden />
            {property.roomCount} room{property.roomCount === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden />
            Roommate friendly
          </span>
        </div>
      </div>
    </Link>
  );
}
