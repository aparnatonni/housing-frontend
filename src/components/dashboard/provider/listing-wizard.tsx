"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { PropertySummary } from "@/lib/types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingButton } from "@/components/data-table";
import { cn } from "cn";

const PROPERTY_TYPES = ["APARTMENT", "STUDIO", "HOUSE", "CONDO", "DUPLEX", "ROOM"] as const;
const ROOM_TYPES = ["SINGLE", "DOUBLE", "SUITE", "STUDIO", "QUAD"] as const;
const AMENITIES = [
  "Gym",
  "Elevator",
  "Laundry",
  "Parking",
  "Garden",
  "Pet Friendly",
  "High-Speed Internet",
  "Rooftop",
  "Pool",
  "Air Conditioning",
  "Heating",
  "Dishwasher",
  "Balcony",
  "Security",
  "Furnished",
];

const positiveNumber = (message: string) =>
  z.string().refine((value) => value.trim() !== "" && !Number.isNaN(Number(value)) && Number(value) > 0, message);

const wizardSchema = z.object({
  title: z.string().trim().min(5, "Give the listing a title (5+ characters)").max(120),
  description: z.string().trim().min(20, "Describe the place in at least 20 characters").max(2000),
  propertyType: z.enum(PROPERTY_TYPES),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  address: z.string().trim().min(3, "Enter the street address"),
  city: z.string().trim().min(2, "Enter the city"),
  area: z.string().trim().optional(),
  state: z.string().trim().min(2, "Enter the state"),
  zipCode: z.string().trim().min(3, "Enter the ZIP / postal code"),
  amenities: z.array(z.string()),
  images: z.array(z.object({ url: z.string().trim().url("Enter a valid image URL (https://…)") })),
  rooms: z
    .array(
      z.object({
        roomType: z.enum(ROOM_TYPES),
        rentAmount: positiveNumber("Enter the monthly rent"),
        capacity: positiveNumber("Enter how many people fit"),
        isAvailable: z.boolean(),
      })
    )
    .min(1, "Add at least one room"),
});

type WizardValues = z.infer<typeof wizardSchema>;

const STEPS = [
  { title: "Basics", fields: ["title", "description", "propertyType", "status"] },
  { title: "Location", fields: ["address", "city", "area", "state", "zipCode"] },
  { title: "Amenities & photos", fields: ["amenities", "images"] },
  { title: "Rooms", fields: ["rooms"] },
  { title: "Review", fields: [] },
] as const;

export function ListingWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState(0);
  const [files, setFiles] = React.useState<File[]>([]);

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      title: "",
      description: "",
      propertyType: "APARTMENT",
      status: "ACTIVE",
      address: "",
      city: "",
      area: "",
      state: "",
      zipCode: "",
      amenities: ["High-Speed Internet"],
      images: [{ url: "" }],
      rooms: [{ roomType: "SINGLE", rentAmount: "", capacity: "1", isAvailable: true }],
    },
  });

  const imageArray = useFieldArray({ control: form.control, name: "images" });
  const roomArray = useFieldArray({ control: form.control, name: "rooms" });

  const stepFields = STEPS[step].fields as readonly (keyof WizardValues)[];

  const goNext = async () => {
    const valid = stepFields.length === 0 || (await form.trigger([...stepFields]));
    if (valid) setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((current) => Math.max(current - 1, 0));

  const onFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const selected = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (selected.length !== fileList.length) toast.error("Only image files are allowed");
    setFiles((previous) => [...previous, ...selected].slice(0, 10));
  };

  const removeFile = (index: number) => {
    setFiles((previous) => previous.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: WizardValues) => {
    const urls = values.images.map((image) => image.url).filter(Boolean);
    if (urls.length === 0 && files.length === 0) {
      form.setError("images", { message: "Add at least one photo URL or upload a file" });
      setStep(2);
      return;
    }

    try {
      const property = await api.post<PropertySummary>("/properties", {
        title: values.title,
        description: values.description,
        address: values.address,
        city: values.city,
        area: values.area || undefined,
        state: values.state,
        zipCode: values.zipCode,
        propertyType: values.propertyType,
        amenities: values.amenities,
        images: urls,
        status: values.status,
      });

      let partial = false;

      for (const room of values.rooms) {
        try {
          await api.post(`/properties/${property.id}/rooms`, {
            roomType: room.roomType,
            rentAmount: Number(room.rentAmount),
            capacity: Number(room.capacity),
            isAvailable: room.isAvailable,
            images: [],
          });
        } catch {
          partial = true;
        }
      }

      for (const file of files) {
        const formData = new FormData();
        formData.append("images", file);
        try {
          await api.upload(`/properties/${property.id}/images`, formData);
        } catch {
          partial = true;
        }
      }

      if (partial) {
        toast.warning("Listing created, but some rooms or photos could not be saved.");
      } else {
        toast.success("Listing created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      router.push("/provider");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not create the listing");
    }
  };

  const values = form.getValues();

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap items-center gap-2 text-xs">
        {STEPS.map((item, index) => (
          <li key={item.title} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-[0.7rem] font-medium",
                index === step
                  ? "border-primary bg-primary text-primary-foreground"
                  : index < step
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
              )}
            >
              {index < step ? <Check className="size-3" aria-hidden /> : index + 1}
            </span>
            <span className={cn(index === step ? "font-medium" : "text-muted-foreground")}>
              {item.title}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="mx-1 hidden h-px w-6 bg-border sm:block" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {step === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>The basics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing title</FormLabel>
                      <FormControl>
                        <Input placeholder="Sunny 2-bedroom near the park" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="What makes this place great to live in?" {...field} />
                      </FormControl>
                      <FormDescription>Tenants read this first — be specific.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property type</FormLabel>
                        <FormControl>
                          <select {...field} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                            {PROPERTY_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type.charAt(0) + type.slice(1).toLowerCase()}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publish state</FormLabel>
                        <FormControl>
                          <select {...field} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                            <option value="ACTIVE">Publish immediately</option>
                            <option value="INACTIVE">Save as draft</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Where is it?</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Street address</FormLabel>
                      <FormControl>
                        <Input placeholder="245 Broadway" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neighbourhood (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Manhattan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP / postal code</FormLabel>
                      <FormControl>
                        <Input placeholder="10007" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card>
              <CardHeader>
                <CardTitle>Amenities &amp; photos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amenities</FormLabel>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {AMENITIES.map((amenity) => {
                          const checked = field.value.includes(amenity);
                          return (
                            <label key={amenity} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) =>
                                  field.onChange(
                                    value === true
                                      ? [...field.value, amenity]
                                      : field.value.filter((item) => item !== amenity)
                                  )
                                }
                              />
                              {amenity}
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Photo URLs</p>
                    <p className="text-xs text-muted-foreground">
                      Link to hosted images (Cloudinary, Unsplash, …).
                    </p>
                  </div>
                  {imageArray.fields.map((item, index) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`images.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input placeholder="https://…/photo.jpg" {...field} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Remove image URL"
                              disabled={imageArray.fields.length === 1}
                              onClick={() => imageArray.remove(index)}
                            >
                              <X aria-hidden />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageArray.append({ url: "" })}
                  >
                    <Plus aria-hidden /> Add another URL
                  </Button>
                </div>

                <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="size-4 text-muted-foreground" aria-hidden />
                    <p className="text-sm font-medium">Upload from your device</p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    aria-label="Upload property photos"
                    onChange={(event) => onFilesSelected(event.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Up to 10 images, 5 MB each. Uploaded after the listing is created.
                  </p>
                  {files.length > 0 ? (
                    <ul className="space-y-1">
                      {files.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1 text-xs">
                          <span className="truncate">{file.name}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${file.name}`}
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeFile(index)}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {step === 3 ? (
            <Card>
              <CardHeader>
                <CardTitle>Rooms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {roomArray.fields.map((item, index) => (
                  <div key={item.id} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.roomType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room type</FormLabel>
                          <FormControl>
                            <select {...field} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                              {ROOM_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type.charAt(0) + type.slice(1).toLowerCase()}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.rentAmount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rent ($/mo)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`rooms.${index}.capacity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end justify-between gap-2">
                      <FormField
                        control={form.control}
                        name={`rooms.${index}.isAvailable`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(value) => field.onChange(value === true)}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Available</FormLabel>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove room"
                        disabled={roomArray.fields.length === 1}
                        onClick={() => roomArray.remove(index)}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    roomArray.append({
                      roomType: "SINGLE",
                      rentAmount: "",
                      capacity: "1",
                      isAvailable: true,
                    })
                  }
                >
                  <Plus aria-hidden /> Add another room
                </Button>
                {form.formState.errors.rooms?.message ? (
                  <p className="text-sm text-destructive">{form.formState.errors.rooms.message}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {step === 4 ? (
            <Card>
              <CardHeader>
                <CardTitle>Review &amp; publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium">{values.title || "Untitled listing"}</p>
                  <p className="text-muted-foreground">
                    {values.propertyType} · {values.address}, {values.city} {values.zipCode}
                  </p>
                </div>
                <p className="text-muted-foreground">{values.description}</p>
                <dl className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Amenities</dt>
                    <dd>{values.amenities.length > 0 ? values.amenities.join(", ") : "None"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Photos</dt>
                    <dd>
                      {values.images.filter((image) => image.url).length} URL(s)
                      {files.length > 0 ? ` + ${files.length} upload(s)` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Status</dt>
                    <dd>{values.status === "ACTIVE" ? "Published" : "Draft"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Rooms</dt>
                    <dd>
                      {values.rooms
                        .map((room) => `${room.roomType} · $${room.rentAmount || 0}`)
                        .join(", ")}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 0}
            >
              <ArrowLeft aria-hidden /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => void goNext()}>
                Continue <ArrowRight aria-hidden />
              </Button>
            ) : (
              <LoadingButton type="submit" loading={form.formState.isSubmitting}>
                Publish listing
              </LoadingButton>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
