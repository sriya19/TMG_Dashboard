import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type ProjectStatus,
  type Priority,
} from "./types";

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency.
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "$0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a date as a short locale string (e.g. "Mar 26, 2026").
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date with time (e.g. "Mar 26, 2026, 2:30 PM").
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Extract initials from a name string (up to 2 characters).
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get the Tailwind color classes for a project status.
 */
export function getStatusColor(status: ProjectStatus): string {
  return STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800";
}

/**
 * Get the human-readable label for a project status.
 */
export function getStatusLabel(status: ProjectStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Get the Tailwind color classes for a priority level.
 */
export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    LOW: "bg-slate-100 text-slate-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };
  return colors[priority] ?? "bg-gray-100 text-gray-700";
}
