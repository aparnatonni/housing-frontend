"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { AdminUser, Paginated, Role } from "@/lib/types";
import { DataTable, LoadingButton, PaginationBar, type Column } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination, useUrlParam } from "@/hooks/use-pagination";
import { initialsOf } from "@/lib/image";

const ROLES: (Role | "ALL")[] = ["ALL", "TENANT", "OWNER", "ADMIN"];

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useUrlParam("search");
  const [role, setRole] = useUrlParam("role");
  const { page, setPage } = usePagination();

  const query = new URLSearchParams({ page: String(page), limit: "20" });
  if (role) query.set("role", role);
  if (search) query.set("search", search);

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["admin-users", query.toString()],
    queryFn: () => api.get<Paginated<AdminUser>>(`/admin/users?${query.toString()}`),
  });

  React.useEffect(() => {
    if (isError) toast.error(error instanceof ApiError ? error.message : "Could not load users");
  }, [isError, error]);

  const toggle = useMutation({
    mutationFn: ({ id, isSuspended }: { id: string; isSuspended: boolean }) =>
      api.patch<AdminUser>(`/admin/users/${id}/status`, { isSuspended }),
    onMutate: async ({ id, isSuspended }) => {
      const key = ["admin-users", query.toString()];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Paginated<AdminUser>>(key);
      if (previous) {
        queryClient.setQueryData<Paginated<AdminUser>>(key, {
          ...previous,
          items: previous.items.map((item) =>
            item.id === id ? { ...item, isSuspended } : item
          ),
        });
      }
      return { previous, key };
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
      toast.error(mutationError instanceof ApiError ? mutationError.message : "Could not update user");
    },
    onSuccess: (_result, variables) =>
      toast.success(variables.isSuspended ? "User suspended" : "User reactivated"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={row.avatarUrl ?? undefined} alt={row.name} />
            <AvatarFallback>{initialsOf(row.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => <Badge variant="secondary">{row.role}</Badge>,
    },
    {
      key: "auth",
      header: "Sign-in",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">{row.provider}</Badge>
          {row.isVerified ? <Badge variant="outline">Verified</Badge> : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.isSuspended ? "SUSPENDED" : "ACTIVE"} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <LoadingButton
          size="xs"
          variant={row.isSuspended ? "outline" : "destructive"}
          loading={toggle.isPending && toggle.variables?.id === row.id}
          onClick={() => toggle.mutate({ id: row.id, isSuspended: !row.isSuspended })}
        >
          {row.isSuspended ? (
            <>
              <ShieldCheck aria-hidden /> Reactivate
            </>
          ) : (
            <>
              <ShieldAlert aria-hidden /> Suspend
            </>
          )}
        </LoadingButton>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(value) => setSearch(value || null)}
          placeholder="Search name, email or phone…"
          className="w-full sm:w-72"
          label="Search users"
        />
        <Select value={role || "ALL"} onValueChange={(value) => setRole(!value || value === "ALL" ? null : value)}>
          <SelectTrigger className="w-40" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "ALL" ? "All roles" : option === "OWNER" ? "Landlord" : option.charAt(0) + option.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isPending}
        empty={
          <EmptyState
            icon={ShieldAlert}
            title="No users found"
            description="Adjust the search or role filter to find the account you need."
          />
        }
      />
      {data ? (
        <PaginationBar
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          onPageChange={setPage}
          isPending={isFetching}
        />
      ) : null}
    </div>
  );
}
