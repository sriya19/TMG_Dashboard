import { clsx } from "clsx";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl border border-slate-200 shadow-sm",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ icon, label, value, change, className }: StatCardProps) {
  return (
    <Card className={clsx("flex items-start gap-4", className)}>
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 text-blue-700 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {change && (
          <p
            className={clsx(
              "text-xs font-medium mt-1",
              change.positive ? "text-green-600" : "text-red-600"
            )}
          >
            {change.positive ? "\u2191" : "\u2193"} {change.value}
          </p>
        )}
      </div>
    </Card>
  );
}
