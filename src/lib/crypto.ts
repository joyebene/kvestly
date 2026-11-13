import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { HttpError } from "./errors";

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

/** Keyed hash so raw IPs / emails never sit in rate-limit or audit collections. */
export function hmac(value: string): string {
  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt && process.env.NODE_ENV === "production") throw new HttpError(500, "Server misconfigured", "config");
  return createHmac("sha256", salt ?? "dev-only-salt").update(value).digest("hex");
}

function key(): Buffer {
  const b64 = process.env.MFA_ENCRYPTION_KEY;
  if (!b64) throw new HttpError(500, "Server misconfigured", "config");
  const k = Buffer.from(b64, "base64");
  if (k.length !== 32) throw new HttpError(500, "Server misconfigured", "config");
  return k;
}

/** AES-256-GCM. Output: iv.tag.ciphertext (base64url). */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(payload: string): string {
  const [iv, tag, enc] = payload.split(".").map((p) => Buffer.from(p, "base64url"));
  const d = createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString("utf8");
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
