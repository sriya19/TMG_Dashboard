import { clsx } from "clsx";

type BadgeVariant =
  | "active"
  | "pending"
  | "completed"
  | "cancelled"
  | "in-progress"
  | "on-hold"
  | "scheduled"
  | "paid"
  | "unpaid"
  | "partial"
  | "default";

interface BadgeProps {
  status: string;
  className?: string;
}

const variantMap: Record<string, BadgeVariant> = {
  active: "active",
  pending: "pending",
  completed: "completed",
  cancelled: "cancelled",
  canceled: "cancelled",
  "in-progress": "in-progress",
  "in progress": "in-progress",
  "on-hold": "on-hold",
  "on hold": "on-hold",
  scheduled: "scheduled",
  paid: "paid",
  unpaid: "unpaid",
  partial: "partial",
};

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-green-50 text-green-700 ring-green-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  completed: "bg-blue-50 text-blue-700 ring-blue-600/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  "in-progress": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "on-hold": "bg-slate-50 text-slate-600 ring-slate-500/20",
  scheduled: "bg-violet-50 text-violet-700 ring-violet-600/20",
  paid: "bg-green-50 text-green-700 ring-green-600/20",
  unpaid: "bg-red-50 text-red-700 ring-red-600/20",
  partial: "bg-amber-50 text-amber-700 ring-amber-600/20",
  default: "bg-slate-50 text-slate-600 ring-slate-500/20",
};

export function Badge({ status, className }: BadgeProps) {
  const variant = variantMap[status.toLowerCase()] ?? "default";

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset",
        variantStyles[variant],
        className
      )}
    >
      {status}
    </span>
  );
}
