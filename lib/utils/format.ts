import { format, formatDistanceToNow, isAfter, parseISO } from "date-fns";

export function formatDate(date: string | Date, formatStr = "MMM d, yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatDateTime(date: string | Date) {
  return formatDate(date, "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(dueDate: string | Date): boolean {
  const d = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  return isAfter(new Date(), d);
}

export function daysUntilDue(dueDate: string | Date): number {
  const d = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number): string {
  return `KSH ${new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount))}`;
}

export function formatKsh(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "KSH 0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "KSH 0";
  return `KSH ${new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
