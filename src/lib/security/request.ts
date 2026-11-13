import "server-only";
import { headers } from "next/headers";
import { hashIp } from "./crypto";

/**
 * Client IP. Behind Cloudflare, `CF-Connecting-IP` is authoritative. It is only
 * trustworthy if the origin accepts traffic ONLY from Cloudflare (see
 * docs/CLOUDFLARE.md: authenticated origin pulls / firewall allow-list).
 */
export async function getClientInfo() {
  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  return {
    ip,
    ipHash: hashIp(ip),
    userAgent: h.get("user-agent")?.slice(0, 300) ?? undefined,
    origin: h.get("origin"),
    host: h.get("host"),
  };
}

/** CSRF defence for cookie-authenticated mutations: require a same-origin request. */
export async function assertSameOrigin(): Promise<boolean> {
  const { origin, host } = await getClientInfo();
  if (!origin) return false; // browsers always send Origin on cross-site/POST fetches
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
