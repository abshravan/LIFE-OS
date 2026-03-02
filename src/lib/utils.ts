import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date string "YYYY-MM-DD" to a readable label */
export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Get today's date as "YYYY-MM-DD" */
export function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Return a system-style label for a discipline score */
export function scoreLabel(score: number): string {
  if (score >= 90) return "OPTIMAL";
  if (score >= 75) return "STABLE";
  if (score >= 55) return "DEGRADED";
  if (score >= 35) return "CRITICAL";
  return "FAILURE";
}

/** Return a CSS color variable name for a discipline score */
export function scoreColor(score: number): string {
  if (score >= 75) return "var(--sys-green)";
  if (score >= 45) return "var(--sys-cyan)";
  if (score >= 25) return "var(--sys-amber)";
  return "var(--sys-red)";
}
