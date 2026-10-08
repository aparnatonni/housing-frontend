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
import { fileToDataUrl, initialsOf } from "@/lib/image";
import type { User } from "@/lib/types";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: z.string().trim().optional().or(z.literal("")),
  bio: z.string().trim().max(500, "Keep your bio under 500 characters").optional().or(z.literal("")),
});

type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export function ProviderProfile() {
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

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ProfileValues) => {
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
      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Avatar className="size-24">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback className="text-xl">{initialsOf(displayName)}</AvatarFallback>
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
            Tenants see your photo on their application updates.
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Public profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                      <FormLabel>Contact phone</FormLabel>
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
                    <FormLabel>About you</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Tell tenants who manages the property and how you work…"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Shown on every listing you publish.</FormDescription>
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
