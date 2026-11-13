import { handle } from "@/lib/api";
import { contactSchema } from "@/lib/validators";
import { hmac } from "@/lib/crypto";
import { ContactMessage } from "@/models/ContactMessage";

export const POST = handle({ auth: "none", schema: contactSchema, turnstile: true, limit: ["contact", 5, 3600] }, async ({ body, ip }) => {
  if (body.website) return { ok: true }; // honeypot tripped: pretend success, store nothing
  await ContactMessage.create({ name: body.name, email: body.email, phone: body.phone || undefined, subject: body.subject, message: body.message, ipHash: hmac(ip) });
  return { ok: true };
});
