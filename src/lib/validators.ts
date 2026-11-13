import { z } from "zod";

// Strip control chars & trim; React escapes on render, Mongo gets plain values (no operators — see sanitizeBody).
const text = (min: number, max: number) =>
  z.string().transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()).pipe(z.string().min(min).max(max));

const COMMON = ["password", "123456789012", "qwertyuiop12", "letmein12345", "kvesty123456", "administrator"];
export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128)
  .refine((p) => !COMMON.some((c) => p.toLowerCase().includes(c)), "That password is too easy to guess.");

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")).pipe(z.string().max(254));
const turnstileToken = z.string().max(2048).optional();
const country = z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Use a 2-letter country code.");
const phone = z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number.");

export const registerSchema = z.object({
  fullName: text(2, 120),
  email,
  password: passwordSchema,
  country: country.optional(),
  acceptTerms: z.literal(true, { error: "You must accept the Terms and Privacy Policy." }),
  acknowledgeRisk: z.literal(true, { error: "You must acknowledge the Risk Disclosure." }),
  turnstileToken,
});

export const loginSchema = z.object({ email, password: z.string().min(1).max(128), turnstileToken });
export const mfaCodeSchema = z.object({ code: z.string().trim().min(6).max(20) });
export const mfaLoginSchema = mfaCodeSchema.extend({ turnstileToken });

export const contactSchema = z.object({
  name: text(2, 120),
  email,
  phone: z.union([phone, z.literal("")]).optional(),
  subject: text(3, 160),
  message: text(10, 5000),
  website: z.string().max(200).optional(), // honeypot — real users never fill this; non-empty = bot
  turnstileToken,
});

export const kycSchema = z.object({
  legalName: text(2, 160),
  dateOfBirth: z.iso.date(),
  country,
  idType: z.enum(["passport", "national_id", "drivers_licence", "residence_permit"]),
});

const money = z.string().trim().regex(/^\d{1,9}(\.\d{1,2})?$/, "Enter a valid amount.");
export const toMinor = (s: string) => Math.round(parseFloat(s) * 100);
export const fundingSchema = z.object({
  kind: z.enum(["deposit", "withdrawal"]),
  amount: money,
  note: text(0, 500).optional(),
});

export const ticketSchema = z.object({ subject: text(3, 160), message: text(5, 4000) });
export const ticketReplySchema = z.object({ message: text(1, 4000) });

export const productSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{3,80}$/),
  name: text(3, 120),
  assetClass: text(2, 80),
  summary: text(10, 600),
  minInvestmentUsd: z.number().int().min(0).max(10_000_000).optional(),
  terms: text(0, 8000).optional(),
  fees: text(0, 4000).optional(),
  riskDisclosure: text(0, 8000).optional(),
  eligibility: text(0, 4000).optional(),
  performanceDisclosure: text(0, 4000).optional(),
  jurisdictions: z.array(country).max(60).default([]),
});

export const reviewSchema = z.object({ decision: z.enum(["approve", "reject"]), note: text(0, 1000).optional() });
export const roleSchema = z.object({ role: z.enum(["client", "support", "compliance", "finance", "admin", "superadmin"]) });
export const statusSchema = z.object({ status: z.enum(["active", "suspended"]), reason: text(3, 500) });
export const notifySchema = z.object({ userId: z.string().regex(/^[a-f0-9]{24}$/), title: text(3, 160), body: text(3, 2000) });
export const contentSchema = z.object({ key: z.string().regex(/^[a-z0-9._-]{3,80}$/), title: text(2, 160), body: text(1, 6000), published: z.boolean() });

/** Language that must never appear in published investment marketing. */
export const PROHIBITED_CLAIMS = /\b(guarantee[sd]?|risk[- ]free|no risk|assured returns?|certain profit|double your (money|investment)|100\s?%\s*(return|roi|profit))\b/i;

/**
 * True if text makes a prohibited promise. Honest negations ("returns are not guaranteed",
 * "we cannot guarantee", "no guarantee") are allowed — they are exactly what a risk disclosure should say.
 */
export function hasProhibitedClaim(text: string): boolean {
  const cleaned = text
    .replace(/\b(?:not|no|never|cannot|can't|can not|without|nor|n't)\s+(?:\w+\s+){0,3}?guarantee[sd]?\b/gi, " ")
    .replace(/\bguarantee[sd]?\s+(?:is|are|was|were)?\s*(?:not|never)\b/gi, " ")
    .replace(/\bnon-guaranteed\b/gi, " ");
  return PROHIBITED_CLAIMS.test(cleaned);
}
