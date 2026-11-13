import "server-only";
import { isProd, readEnv } from "../env";

/**
 * Server-side Cloudflare Turnstile verification.
 * - TURNSTILE_SECRET_KEY must stay server-side only.
 * - In production a missing secret FAILS CLOSED (requests are rejected).
 * - In development, with no secret configured, verification is skipped so the
 *   forms can be exercised locally. Cloudflare publishes test keys for this.
 */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = readEnv("TURNSTILE_SECRET_KEY");
  if (!secret) return !isProd;
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
