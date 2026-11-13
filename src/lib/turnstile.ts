import { HttpError } from "./errors";

/** Server-side Cloudflare Turnstile verification. Fails CLOSED in production. */
export async function verifyTurnstile(token: string | undefined, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new HttpError(503, "Verification is temporarily unavailable.", "turnstile_not_configured");
    }
    return; // dev convenience only
  }
  if (!token) throw new HttpError(400, "Please complete the verification challenge.", "turnstile_missing");
  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);
  let ok = false;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    ok = Boolean(((await r.json()) as { success?: boolean }).success);
  } catch {
    throw new HttpError(503, "Verification is temporarily unavailable.", "turnstile_unreachable");
  }
  if (!ok) throw new HttpError(400, "Verification failed. Please try again.", "turnstile_failed");
}
