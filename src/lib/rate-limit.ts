import { RateLimit } from "@/models/RateLimit";
import { connectDb } from "./db";
import { HttpError } from "./errors";
import { hmac } from "./crypto";

/** Fixed-window limiter backed by MongoDB (TTL-cleaned). Cloudflare rate-limiting rules sit in front of this. */
export async function rateLimit(name: string, id: string, max: number, windowSec: number) {
  await connectDb();
  const key = `${name}:${hmac(id)}`;
  const doc = await RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(Date.now() + windowSec * 1000) } },
    { upsert: true, new: true },
  );
  if (doc.count > max) {
    const retry = Math.max(1, Math.ceil((doc.expiresAt.getTime() - Date.now()) / 1000));
    throw new HttpError(429, "Too many attempts. Please wait and try again.", "rate_limited", undefined, {
      "Retry-After": String(retry),
    });
  }
}
