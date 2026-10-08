import { cn } from "cn";

const TONE_CLASS: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  info: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  neutral: "bg-muted text-muted-foreground",
};

const STATUS_TONE: Record<string, keyof typeof TONE_CLASS> = {
  ACTIVE: "success",
  APPROVED: "success",
  PAID: "success",
  VALID: "success",
  SUCCESS: "success",
  COMPLETED: "success",
  RESOLVED: "success",
  SETTLED: "success",
  OPEN: "info",
  PENDING: "warning",
  DUE: "warning",
  IN_PROGRESS: "info",
  MEDIUM: "warning",
  HIGH: "danger",
  URGENT: "danger",
  REJECTED: "danger",
  FAILED: "danger",
  CANCELLED: "danger",
  OVERDUE: "danger",
  INACTIVE: "neutral",
  CLOSED: "neutral",
  ENDED: "neutral",
  LOW: "neutral",
};

export function statusTone(status: string): keyof typeof TONE_CLASS {
  return STATUS_TONE[status] ?? "neutral";
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap",
        TONE_CLASS[tone],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status.replaceAll("_", " ")}
    </span>
  );
}
