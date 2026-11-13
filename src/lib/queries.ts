import "server-only";
import { connectDb } from "./db";
import { LedgerEntry } from "@/models/LedgerEntry";

/** Settled ledger totals per currency. Derived only from provider-confirmed entries — never estimated. */
export async function ledgerSummary(userId: string) {
  await connectDb();
  const rows = await LedgerEntry.aggregate<{ _id: { currency: string; direction: string; type: string }; total: number; n: number }>([
    { $match: { userId: new (await import("mongoose")).Types.ObjectId(userId), status: "settled" } },
    { $group: { _id: { currency: "$currency", direction: "$direction", type: "$type" }, total: { $sum: "$amountMinor" }, n: { $sum: 1 } } },
  ]);
  return rows;
}
