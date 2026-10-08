"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CalendarDays, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/data-table";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type { Room } from "@/lib/types";

const viewingSchema = z.object({
  requestedDate: z.string().min(1, "Pick a date and time"),
  notes: z
    .string()
    .trim()
    .max(500, "Keep notes under 500 characters")
    .optional()
    .or(z.literal("")),
});

type ViewingValues = z.infer<typeof viewingSchema>;

const applicationSchema = z.object({
  moveInDate: z.string().min(1, "Pick your move-in date"),
  note: z
    .string()
    .trim()
    .min(10, "Tell the landlord a bit about yourself (10+ characters)")
    .max(1000, "Keep it under 1000 characters"),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

export function RoomActions({
  room,
  propertyTitle,
  propertyId,
}: {
  room: Room;
  propertyTitle: string;
  propertyId: string;
}) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  const router = useRouter();
  const [viewingOpen, setViewingOpen] = React.useState(false);
  const [applyOpen, setApplyOpen] = React.useState(false);

  const isTenant = user?.role === "TENANT";

  const viewingForm = useForm<ViewingValues>({
    resolver: zodResolver(viewingSchema),
    defaultValues: { requestedDate: "", notes: "" },
  });

  const applicationForm = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { moveInDate: "", note: "" },
  });

  const onApplyError = (error: unknown) => {
    toast.error(error instanceof ApiError ? error.message : "Something went wrong");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button render={<Link href={`/login?next=${encodeURIComponent(`/listings/${propertyId}`)}`}/>}>
          Sign in to request a viewing
        </Button>
      </div>
    );
  }

  if (!isTenant) {
    return (
      <p className="text-xs text-muted-foreground">
        Only tenant accounts can send viewing requests or applications.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Dialog open={viewingOpen} onOpenChange={setViewingOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" disabled={!room.isAvailable}>
              <CalendarDays aria-hidden /> Request viewing
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a viewing</DialogTitle>
            <DialogDescription>
              {room.roomType} room at {propertyTitle}. The landlord will confirm or propose a new
              time.
            </DialogDescription>
          </DialogHeader>
          <Form {...viewingForm}>
            <form
              onSubmit={viewingForm.handleSubmit(async (values) => {
                try {
                  await api.post("/viewing-requests", {
                    roomId: room.id,
                    requestedDate: new Date(values.requestedDate).toISOString(),
                    notes: values.notes || undefined,
                  });
                  toast.success("Viewing request sent");
                  setViewingOpen(false);
                  viewingForm.reset();
                } catch (error) {
                  onApplyError(error);
                }
              })}
              className="space-y-4"
              noValidate
            >
              <FormField
                control={viewingForm.control}
                name="requestedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred date &amp; time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={viewingForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Any questions for the landlord?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setViewingOpen(false)}>
                  Cancel
                </Button>
                <LoadingButton type="submit" loading={viewingForm.formState.isSubmitting}>
                  Send request
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogTrigger
          render={
            <Button disabled={!room.isAvailable}>
              <FileText aria-hidden /> Apply for this room
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for this room</DialogTitle>
            <DialogDescription>
              {room.roomType} · {formatMoney(room.rentAmount)}/mo · {propertyTitle}. Applying is
              non-binding until the landlord approves.
            </DialogDescription>
          </DialogHeader>
          <Form {...applicationForm}>
            <form
              onSubmit={applicationForm.handleSubmit(async (values) => {
                try {
                  await api.post("/applications", {
                    roomId: room.id,
                    moveInDate: new Date(values.moveInDate).toISOString(),
                    note: values.note,
                  });
                  toast.success("Application submitted");
                  setApplyOpen(false);
                  applicationForm.reset();
                  router.push("/dashboard");
                } catch (error) {
                  onApplyError(error);
                }
              })}
              className="space-y-4"
              noValidate
            >
              <FormField
                control={applicationForm.control}
                name="moveInDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Move-in date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={applicationForm.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About you</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="I'm a quiet professional looking to move in early…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setApplyOpen(false)}>
                  Cancel
                </Button>
                <LoadingButton type="submit" loading={applicationForm.formState.isSubmitting}>
                  Submit application
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
