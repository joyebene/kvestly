import mongoose, { Schema, type Model, type Types } from "mongoose";

export const PRODUCT_STATUSES = ["draft", "in_review", "approved", "published", "retired"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface IProduct {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  summary: string;
  status: ProductStatus;
  assetClass?: string;
  /** Only meaningful once the product terms are verified and approved. */
  minInvestmentUSD?: number;
  terms?: string;
  fees?: string;
  riskDisclosure?: string;
  eligibility?: string;
  jurisdictions: string[];
  /** Two different people must approve before publication (four-eyes principle). */
  complianceApprovedBy?: Types.ObjectId;
  legalApprovedBy?: Types.ObjectId;
  createdBy: Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    summary: { type: String, required: true, trim: true, maxlength: 600 },
    status: { type: String, enum: PRODUCT_STATUSES, default: "draft", index: true },
    assetClass: { type: String, trim: true, maxlength: 80 },
    minInvestmentUSD: { type: Number, min: 0 },
    terms: { type: String, maxlength: 20000 },
    fees: { type: String, maxlength: 5000 },
    riskDisclosure: { type: String, maxlength: 10000 },
    eligibility: { type: String, maxlength: 5000 },
    jurisdictions: { type: [String], default: [] },
    complianceApprovedBy: { type: Schema.Types.ObjectId, ref: "User" },
    legalApprovedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct> | undefined) ?? mongoose.model<IProduct>("Product", productSchema);
