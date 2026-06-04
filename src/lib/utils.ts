import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { RiskLevel } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | null) {
  if (!value) return "Non renseigne";
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return format(date, "dd MMM yyyy");
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Non renseigne";
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return format(date, "dd MMM yyyy, HH:mm");
}

export function formatRelative(value?: string | null) {
  if (!value) return "Aucune activite";
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function escapePostgrestFilter(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_").replace(/,/g, "\\,");
}

export function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function calculateRisk(probability: number, impact: number) {
  const score = Number(probability || 0) * Number(impact || 0);
  let level: RiskLevel = "Low";

  if (score >= 16) level = "Critical";
  else if (score >= 10) level = "High";
  else if (score >= 5) level = "Medium";

  return { score, level };
}

export function initials(value?: string | null) {
  if (!value) return "QP";
  return value
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isTruthy(value: unknown) {
  return value === true || value === "true" || value === "on" || value === 1;
}

export function compactObject<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}
