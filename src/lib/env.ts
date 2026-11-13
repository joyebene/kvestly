import "server-only";

export const isProd = process.env.NODE_ENV === "production";

/** Read a server-side env var. Returns undefined when unset/blank. */
export function readEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

export function isDbConfigured(): boolean {
  return Boolean(readEnv("MONGODB_URI"));
}

/** Auth needs a long random secret plus an AES key for MFA secrets. */
export function isAuthConfigured(): boolean {
  const s = readEnv("SESSION_SECRET");
  const k = readEnv("MFA_ENCRYPTION_KEY");
  return Boolean(isDbConfigured() && s && s.length >= 32 && k && Buffer.from(k, "base64").length === 32);
}

export function requireSessionSecret(): Uint8Array {
  const s = readEnv("SESSION_SECRET");
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  }
  return new TextEncoder().encode(s);
}

export function requireMfaKey(): Buffer {
  const k = readEnv("MFA_ENCRYPTION_KEY");
  const buf = k ? Buffer.from(k, "base64") : undefined;
  if (!buf || buf.length !== 32) {
    throw new Error("MFA_ENCRYPTION_KEY must be a base64-encoded 32-byte key (openssl rand -base64 32).");
  }
  return buf;
}
