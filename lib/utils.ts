import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function proxiedImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return `/api/v1/images/proxy?url=${encodeURIComponent(url)}`;
}
