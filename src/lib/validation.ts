import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);
const name = z
  .string()
  .trim()
  .min(2, "Enter your full name")
  .max(100)
  .regex(/^[\p{L}\p{M}' .-]+$/u, "Name contains unsupported characters");
const phone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+()\d\s-]{7,30}$/, "Enter a valid phone number")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number");

const turnstile = z.string().max(4096).optional();

export const contactSchema = z.object({
  name,
  email,
  phone,
  subject: z.string().trim().min(3, "Enter a subject").max(150),
  message: z.string().trim().min(20, "Please write at least 20 characters").max(5000),
  website: z.string().max(0).optional(), // honeypot: must stay empty
  turnstileToken: turnstile,
});

export const registerSchema = z.object({
  name,
  email,
  phone,
  password: passwordSchema,
  acceptTerms: z.literal(true, { error: "You must accept the Terms and Privacy Policy" }),
  acknowledgeRisk: z.literal(true, { error: "You must acknowledge the risk disclosure" }),
  turnstileToken: turnstile,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
  mfaCode: z.string().trim().max(20).optional(),
  turnstileToken: turnstile,
});

export type ContactInput = z.infer<typeof contactSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** Flatten zod issues to { field: message } for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] ??= issue.message;
  }
  return out;
}
