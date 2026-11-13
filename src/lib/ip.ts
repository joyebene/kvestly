export function clientIp(h: Headers): string {
  if (process.env.TRUST_CLOUDFLARE_HEADERS === "true") {
    const cf = h.get("cf-connecting-ip");
    if (cf) return cf;
  }
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
