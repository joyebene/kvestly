import { Schema, model, models, type Model, Types } from "mongoose";
import { makeImmutable } from "./_helpers";

/**
 * Append-only double-entry-style ledger. Amounts are integer minor units (no floats).
 * There is NO admin API that creates entries. Entries come only from verified provider
 * webhooks / reconciliation via `recordLedgerEntry()` (src/lib/ledger.ts), each with an audit record.
 * Corrections are made with a new reversing entry (`reversalOf`), never by editing history.
 */
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["deposit", "withdrawal", "investment", "distribution", "fee", "reversal"], required: true },
    direction: { type: String, enum: ["credit", "debit"], required: true },
    amountMinor: { type: Number, required: true, min: 1, validate: Number.isInteger },
    currency: { type: String, required: true, maxlength: 10 },
    status: { type: String, enum: ["pending", "settled", "failed"], required: true },
    source: { type: String, enum: ["provider_webhook", "reconciliation"], required: true },
    providerRef: { type: String, maxlength: 200 },
    productId: { type: Schema.Types.ObjectId, ref: "InvestmentProduct" },
    fundingRequestId: { type: Schema.Types.ObjectId, ref: "FundingRequest" },
    reversalOf: { type: Schema.Types.ObjectId, ref: "LedgerEntry" },
    reason: { type: String, required: true, maxlength: 500 },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
schema.index({ providerRef: 1 }, { unique: true, sparse: true });
makeImmutable(schema);

export interface LedgerDoc {
  _id: Types.ObjectId; userId: Types.ObjectId; type: string; direction: "credit" | "debit"; amountMinor: number;
  currency: string; status: string; source: string; providerRef?: string; reason: string; createdAt: Date;
}
export const LedgerEntry: Model<LedgerDoc> = (models.LedgerEntry as Model<LedgerDoc>) || model<LedgerDoc>("LedgerEntry", schema);
