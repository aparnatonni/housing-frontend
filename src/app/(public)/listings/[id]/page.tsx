import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  Building2,
  CheckCircle2,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { RoomActions } from "@/components/listings/room-actions";
import { ApiError, serverFetch } from "@/lib/api";
import type { PropertyDetail } from "@/lib/types";

async function getProperty(id: string): Promise<PropertyDetail> {
  return serverFetch<PropertyDetail>(`/properties/${id}`, { revalidate: 60 });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const property = await getProperty(id);
    return {
      title: `${property.title} — ${property.city}`,
      description: property.description.slice(0, 160),
      openGraph: {
        title: `${property.title} · NestMate`,
        description: property.description.slice(0, 160),
        images: property.images[0] ? [{ url: property.images[0] }] : undefined,
      },
    };
  } catch {
    return { title: "Listing" };
  }
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let property: PropertyDetail;
  try {
    property = await getProperty(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="font-heading text-2xl font-semibold">Listing not found</h1>
          <p className="text-sm text-muted-foreground">
            This listing may have been removed or deactivated.
          </p>
          <Link
            href="/listings"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to listings
          </Link>
        </div>
      );
    }
    throw error;
  }

  const minRent = property.rooms.length
    ? Math.min(...property.rooms.filter((room) => room.isAvailable).map((room) => room.rentAmount))
    : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> All listings
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="grid gap-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
              <SafeImage
                src={property.images[0]}
                alt={`${property.title} photo 1`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>
            {property.images.length > 1 ? (
              <div className="grid grid-cols-4 gap-2">
                {property.images.slice(1, 5).map((image, index) => (
                  <div
                    key={image + index}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
                  >
                    <SafeImage
                      src={image}
                      alt={`${property.title} photo ${index + 2}`}
                      fill
                      sizes="(max-width: 1024px) 25vw, 16vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Header */}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{property.propertyType}</Badge>
                <StatusBadge status={property.status} />
              </div>
              <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                {property.title}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" aria-hidden />
                {property.address}, {property.area ? `${property.area}, ` : ""}
                {property.city}, {property.state} {property.zipCode}
              </p>
            </div>
            {minRent !== null && Number.isFinite(minRent) ? (
              <p className="font-heading text-2xl font-semibold text-primary">
                {formatMoney(minRent)}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
            ) : null}
          </div>

          {/* Description */}
          <section className="mt-6">
            <h2 className="font-heading text-lg font-semibold">About this place</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {property.description}
            </p>
          </section>

          {/* Amenities */}
          {property.amenities.length > 0 ? (
            <section className="mt-6">
              <h2 className="font-heading text-lg font-semibold">Amenities</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium"
                  >
                    <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Rooms */}
          <section className="mt-8">
            <h2 className="font-heading text-lg font-semibold">
              Rooms ({property.rooms.length})
            </h2>
            {property.rooms.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No rooms have been listed for this property yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {property.rooms.map((room) => (
                  <li
                    key={room.id}
                    className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <BedDouble className="size-4 text-primary" aria-hidden />
                          <h3 className="font-heading text-base font-semibold">
                            {room.roomType} room
                          </h3>
                          <Badge variant={room.isAvailable ? "secondary" : "outline"}>
                            {room.isAvailable ? "Available" : "Taken"}
                          </Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="size-3.5" aria-hidden />
                            Capacity {room.capacity}
                          </span>
                          <span>{formatMoney(room.rentAmount)}/month</span>
                        </p>
                      </div>
                    </div>
                    {room.images.length > 0 ? (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {room.images.slice(0, 3).map((image, index) => (
                          <div
                            key={image + index}
                            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
                          >
                            <SafeImage
                              src={image}
                              alt={`${room.roomType} room photo ${index + 1}`}
                              fill
                              sizes="20vw"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-4">
                      <RoomActions
                        room={room}
                        propertyTitle={property.title}
                        propertyId={property.id}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
              <h2 className="font-heading text-base font-semibold">Listed by</h2>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building2 className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="flex items-center gap-1 text-sm font-medium">
                    {property.owner.name}
                    {property.owner.isVerified ? (
                      <BadgeCheck className="size-4 text-primary" aria-hidden />
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{property.owner.email}</p>
                  {property.owner.phone ? (
                    <p className="text-xs text-muted-foreground">{property.owner.phone}</p>
                  ) : null}
                </div>
              </div>
              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Listed on</dt>
                  <dd>{new Date(property.createdAt).toLocaleDateString("en-US")}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Rooms</dt>
                  <dd>{property.rooms.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Available now</dt>
                  <dd className="inline-flex items-center gap-1">
                    {property.rooms.some((room) => room.isAvailable) ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-emerald-600" aria-hidden /> Yes
                      </>
                    ) : (
                      <>
                        <XCircle className="size-3.5 text-muted-foreground" aria-hidden /> Waitlist
                      </>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl bg-muted/40 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">How NestMate works</p>
              <p className="mt-1">
                Request a viewing, apply for the room online, and pay rent securely once your
                tenancy starts. Every step is tracked in your dashboard.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
