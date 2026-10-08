"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/data-table";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type { User } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: z.string().trim().optional().or(z.literal("")),
  bio: z.string().trim().max(500, "Keep your bio under 500 characters").optional().or(z.literal("")),
});

type ProfileValues = z.infer<typeof profileSchema>;

const money = z
  .string()
  .refine(
    (value) => value.trim() === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    "Enter a valid budget"
  );

const roommateSchema = z.object({
  minBudget: money.optional(),
  maxBudget: money.optional(),
  preferredCity: z.string().trim().optional().or(z.literal("")),
  genderPreference: z.enum(["ANY", "MALE", "FEMALE", "OTHER"]).optional(),
  lifestyleTags: z.string().trim().optional().or(z.literal("")),
  isSmoker: z.boolean().optional(),
  hasPets: z.boolean().optional(),
  moveInDate: z.string().optional().or(z.literal("")),
});

type RoommateValues = z.infer<typeof roommateSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Za-z]/, "New password must include a letter"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

/** Downscale an image file to a small JPEG data URL so it can be stored as avatarUrl. */
function fileToDataUrl(file: File, maxSize = 192): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ProfileForm() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = React.useState(false);

  const { data: profile, isPending } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => api.get<User>("/users/me"),
  });

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? user?.name ?? "",
      phone: profile?.phone ?? "",
      bio: (profile as (User & { bio?: string }) | undefined)?.bio ?? "",
    },
  });

  const roommateForm = useForm<RoommateValues>({
    resolver: zodResolver(roommateSchema),
    defaultValues: {
      minBudget: "",
      maxBudget: "",
      preferredCity: "",
      genderPreference: "ANY",
      lifestyleTags: "",
      isSmoker: false,
      hasPets: false,
      moveInDate: "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onProfileSubmit = async (values: ProfileValues) => {
    try {
      const updated = await api.patch<User>("/users/me", {
        name: values.name,
        phone: values.phone || undefined,
        bio: values.bio || undefined,
      });
      setUser(updated);
      queryClient.setQueryData(["my-profile"], updated);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not update profile");
    }
  };

  const onRoommateSubmit = async (values: RoommateValues) => {
    try {
      await api.patch<User>("/users/me", {
        roommatePreference: {
          minBudget: values.minBudget ? Number(values.minBudget) : undefined,
          maxBudget: values.maxBudget ? Number(values.maxBudget) : undefined,
          preferredCity: values.preferredCity || undefined,
          genderPreference: values.genderPreference,
          lifestyleTags: values.lifestyleTags
            ? values.lifestyleTags.split(",").map((tag) => tag.trim()).filter(Boolean)
            : undefined,
          isSmoker: values.isSmoker ?? false,
          hasPets: values.hasPets ?? false,
          moveInDate: values.moveInDate ? new Date(values.moveInDate).toISOString() : undefined,
        },
      });
      toast.success("Roommate preferences saved");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not save preferences");
    }
  };

  const onPasswordSubmit = async (values: PasswordValues) => {
    try {
      await api.patch("/users/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed");
      passwordForm.reset();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not change password");
    }
  };

  const onAvatarChange = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setSavingAvatar(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarPreview(dataUrl);
      const updated = await api.patch<User>("/users/me", { avatarUrl: dataUrl });
      setUser(updated);
      queryClient.setQueryData(["my-profile"], updated);
      toast.success("Profile photo updated");
    } catch (error) {
      setAvatarPreview(null);
      toast.error(error instanceof ApiError ? error.message : "Could not update photo");
    } finally {
      setSavingAvatar(false);
    }
  };

  const displayName = profile?.name ?? user?.name ?? "";
  const avatarSrc = avatarPreview ?? profile?.avatarUrl ?? user?.avatarUrl ?? undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Avatar card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Avatar className="size-24">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback className="text-xl">
              {displayName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Upload profile photo"
              onChange={(event) => onAvatarChange(event.target.files?.[0])}
            />
            <span className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm font-medium transition-colors hover:bg-muted">
              <Camera className="size-4" aria-hidden />
              {savingAvatar ? "Uploading…" : "Upload photo"}
            </span>
          </label>
          <p className="text-center text-xs text-muted-foreground">
            JPG or PNG, up to 5 MB. The photo is stored with your profile.
          </p>
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1-555-0100" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Tell landlords a bit about yourself…"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Shown to landlords when you apply.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton type="submit" loading={form.formState.isSubmitting}>
                <Save aria-hidden /> Save changes
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Roommate preferences */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Roommate preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...roommateForm}>
            <form
              onSubmit={roommateForm.handleSubmit(onRoommateSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={roommateForm.control}
                  name="minBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min budget ($/mo)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={roommateForm.control}
                  name="maxBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max budget ($/mo)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={roommateForm.control}
                  name="preferredCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred city</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={roommateForm.control}
                  name="genderPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender preference</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                        >
                          <option value="ANY">Any</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={roommateForm.control}
                  name="lifestyleTags"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Lifestyle tags</FormLabel>
                      <FormControl>
                        <Input placeholder="non-smoker, early-riser, clean" {...field} />
                      </FormControl>
                      <FormDescription>Comma separated.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={roommateForm.control}
                  name="moveInDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Earliest move-in</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col justify-center gap-3">
                  <FormField
                    control={roommateForm.control}
                    name="isSmoker"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">I smoke</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={roommateForm.control}
                    name="hasPets"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">I have pets</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <LoadingButton type="submit" loading={roommateForm.formState.isSubmitting}>
                <Save aria-hidden /> Save preferences
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="grid gap-4 sm:grid-cols-3"
              noValidate
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sm:col-span-3">
                <Separator className="mb-4" />
                <LoadingButton type="submit" loading={passwordForm.formState.isSubmitting}>
                  Update password
                </LoadingButton>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
