import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""));

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: optionalText(200),
  message: z.string().trim().min(10).max(5000),
  phone: optionalText(30),
  countryCode: z
    .string()
    .trim()
    .regex(/^\+\d{1,4}$/)
    .optional()
    .or(z.literal("")),
  honeypot: optionalText(120),
  recaptchaToken: z.string().trim().max(4096).optional().or(z.literal(""))
});

export function sanitizeInput(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeHeader(value: string) {
  return value.replace(/[\r\n\u0000-\u001F\u007F]/g, "").trim();
}
