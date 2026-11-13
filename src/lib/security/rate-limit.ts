import "server-only";
import { connectDb } from "../db";
import { RateLimitModel } from "../models/RateLimit";

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Fixed-window limiter backed by MongoDB (atomic upsert + $inc) so limits hold
 * across multiple server instances. Cloudflare rate limiting is the first line
 * of defence; this is the in-application second layer.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateResult> {
  await connectDb();
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSec * 1000)) * windowSec * 1000;
  const expiresAt = new Date(windowStart + windowSec * 1000);
  const doc = await RateLimitModel.findOneAndUpdate(
    { key: `${key}:${windowStart}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, new: true },
  ).lean();
  const count = doc?.count ?? 1;
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSec: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
  };
}
