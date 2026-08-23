import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "Date non renseignée";
  if (dateString.includes("/")) return dateString; // Already JJ/MM/AAAA
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function getTodayFormatted(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Extracts and cleans a URL from an arbitrary text snippet (e.g. shared text like "Check out this offer (https://...)").
 */
export function extractUrl(input: string): string {
  if (!input || typeof input !== "string") return "";

  // 1. Look for explicit http/https URL
  const httpMatch = input.match(/https?:\/\/[^\s)\]>"']+/i);
  if (httpMatch) {
    return httpMatch[0].replace(/[.,;:!?)\]>"']+$/, "");
  }

  // 2. Look for www. URLs
  const wwwMatch = input.match(/\bwww\.[^\s)\]>"']+/i);
  if (wwwMatch) {
    return `https://${wwwMatch[0].replace(/[.,;:!?)\]>"']+$/, "")}`;
  }

  return input.trim();
}

