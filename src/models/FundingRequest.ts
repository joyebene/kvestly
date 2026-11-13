import { Schema, model, models, type Model, Types } from "mongoose";

/**
 * A *request* only. Creating or approving one does not move money — settlement is performed by a
 * verified payment/custody provider and recorded in the ledger. We store a provider-issued
 * reference to a payout method, never raw bank/card credentials, private keys or seed phrases.
 */
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: ["deposit", "withdrawal"], required: true },
    amountMinor: { type: Number, required: true, min: 1, validate: Number.isInteger },
    currency: { type: String, required: true, default: "USD", maxlength: 10 },
    status: { type: String, enum: ["pending", "under_review", "approved", "rejected", "cancelled", "completed"], default: "pending", index: true },
    payoutMethodRef: { type: String, maxlength: 200 },
    userNote: { type: String, maxlength: 500 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewNote: { type: String, maxlength: 1000 },
  },
  { timestamps: true },
);
export interface FundingDoc {
  _id: Types.ObjectId; userId: Types.ObjectId; kind: "deposit" | "withdrawal"; amountMinor: number; currency: string;
  status: string; userNote?: string; reviewNote?: string; createdAt: Date;
}
export const FundingRequest: Model<FundingDoc> = (models.FundingRequest as Model<FundingDoc>) || model<FundingDoc>("FundingRequest", schema);
