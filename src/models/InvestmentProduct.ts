import { Schema, model, models, type Model, Types } from "mongoose";

/**
 * A product can only be PUBLISHED when every disclosure field is filled AND a second,
 * different person with `products:publish` has recorded compliance approval (four-eyes).
 * There is deliberately no field for "guaranteed return"; any return language lives in
 * `performanceDisclosure` and is scanned for prohibited wording before publication.
 */
const schema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, maxlength: 80 },
    name: { type: String, required: true, maxlength: 120 },
    assetClass: { type: String, required: true, maxlength: 80 },
    summary: { type: String, required: true, maxlength: 600 },
    minInvestment: { amountMinor: Number, currency: { type: String, default: "USD" } },
    terms: { type: String, maxlength: 8000 },
    fees: { type: String, maxlength: 4000 },
    riskDisclosure: { type: String, maxlength: 8000 },
    eligibility: { type: String, maxlength: 4000 },
    performanceDisclosure: { type: String, maxlength: 4000 },
    jurisdictions: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "in_review", "published", "archived"], default: "draft", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    compliance: {
      approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
      approvedAt: Date,
      reference: { type: String, maxlength: 120 },
    },
    publishedAt: Date,
  },
  { timestamps: true },
);
export interface ProductDoc {
  _id: Types.ObjectId; slug: string; name: string; assetClass: string; summary: string;
  minInvestment?: { amountMinor?: number; currency?: string }; terms?: string; fees?: string;
  riskDisclosure?: string; eligibility?: string; performanceDisclosure?: string; jurisdictions: string[];
  status: "draft" | "in_review" | "published" | "archived"; createdBy: Types.ObjectId;
  compliance?: { approvedBy?: Types.ObjectId; approvedAt?: Date; reference?: string }; publishedAt?: Date;
}
export const InvestmentProduct: Model<ProductDoc> =
  (models.InvestmentProduct as Model<ProductDoc>) || model<ProductDoc>("InvestmentProduct", schema);
