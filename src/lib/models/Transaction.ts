import mongoose, { Schema, type Model, type Types } from "mongoose";

export const TX_TYPES = ["deposit", "withdrawal", "investment", "return", "fee", "adjustment"] as const;
export const TX_STATUSES = ["pending", "completed", "failed", "reversed"] as const;

export interface ITransaction {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: (typeof TX_TYPES)[number];
  status: (typeof TX_STATUSES)[number];
  /** Integer minor units (e.g. cents). Never floating point. */
  amountMinor: number;
  currency: string;
  /** Reference issued by the verified payment / custody provider. Required for completed deposits & withdrawals. */
  providerRef?: string;
  /** Corrections are made by a NEW entry that points at the one it reverses. */
  reversalOf?: Types.ObjectId;
  reason?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const txSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: TX_TYPES, required: true },
    status: { type: String, enum: TX_STATUSES, required: true, default: "pending" },
    amountMinor: { type: Number, required: true, validate: Number.isSafeInteger },
    currency: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 10 },
    providerRef: { type: String, maxlength: 200 },
    reversalOf: { type: Schema.Types.ObjectId, ref: "Transaction" },
    reason: { type: String, maxlength: 500 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

/**
 * Ledger entries are immutable. There is deliberately NO update/delete path and
 * NO admin API that creates financial records manually. Status progression and
 * corrections arrive from verified provider integrations as new, audited entries.
 */
const blocked = [
  "updateOne",
  "updateMany",
  "findOneAndUpdate",
  "findOneAndReplace",
  "replaceOne",
  "deleteOne",
  "deleteMany",
  "findOneAndDelete",
] as const;
for (const op of blocked) {
  txSchema.pre(op, function () {
    throw new Error("Transactions are immutable. Create a reversing entry instead.");
  });
}
txSchema.pre("save", function () {
  if (!this.isNew) throw new Error("Transactions are immutable. Create a reversing entry instead.");
});

export const Transaction: Model<ITransaction> =
  (mongoose.models.Transaction as Model<ITransaction> | undefined) ??
  mongoose.model<ITransaction>("Transaction", txSchema);
