import "server-only";
import { LedgerEntry } from "@/models/LedgerEntry";
import { connectDb } from "./db";
import { audit } from "./audit";
import type { Types } from "mongoose";

export interface NewLedgerEntry {
  userId: Types.ObjectId | string;
  type: "deposit" | "withdrawal" | "investment" | "distribution" | "fee" | "reversal";
  direction: "credit" | "debit";
  amountMinor: number;
  currency: string;
  status: "pending" | "settled" | "failed";
  source: "provider_webhook" | "reconciliation";
  providerRef: string; // REQUIRED: provider-issued reference proves the movement is real
  reason: string;
  reversalOf?: Types.ObjectId | string;
}

/**
 * The ONLY way a financial record can be created. Intended callers: verified provider webhook
 * handlers and reconciliation jobs (not yet built — no provider is connected). There is no
 * human/admin entry point, so staff cannot fabricate transactions. The audit record is written
 * first and is *critical*: if it fails, the entry is not created.
 */
export async function recordLedgerEntry(e: NewLedgerEntry) {
  if (!e.providerRef) throw new Error("providerRef is required");
  await connectDb();
  await audit({ action: "ledger.record", target: { type: "ledger", id: e.providerRef }, meta: { ...e, userId: String(e.userId) } }, { critical: true });
  return LedgerEntry.create(e);
}
