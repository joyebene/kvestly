import { AuditLog } from "@/models/AuditLog";
import { connectDb } from "./db";
import { hmac } from "./crypto";
import { clientIp } from "./ip";
import type { Types } from "mongoose";

export interface AuditInput {
  action: string;
  actor?: { id: string | Types.ObjectId; role: string } | null;
  target?: { type: string; id: string };
  outcome?: "success" | "denied" | "failure";
  meta?: Record<string, unknown>;
  headers?: Headers;
}

/** Writes an immutable audit record. Never throws into the caller's flow for non-critical logging. */
export async function audit(i: AuditInput, { critical = false } = {}) {
  try {
    await connectDb();
    await AuditLog.create({
      actorId: i.actor?.id,
      actorRole: i.actor?.role,
      action: i.action,
      targetType: i.target?.type,
      targetId: i.target?.id,
      outcome: i.outcome ?? "success",
      ipHash: i.headers ? hmac(clientIp(i.headers)) : undefined,
      userAgent: i.headers?.get("user-agent")?.slice(0, 300),
      meta: i.meta,
    });
  } catch (e) {
    console.error("[audit] failed", i.action, e);
    // Sensitive admin/financial actions must not proceed without a record.
    if (critical) throw e;
  }
}
