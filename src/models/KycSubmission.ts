import { Schema, model, models, type Model, Types } from "mongoose";

/**
 * Metadata only. Identity documents must live in private, encrypted object storage
 * (e.g. Cloudflare R2 with signed URLs) or with a KYC provider — never in MongoDB.
 * `documentRefs` holds opaque storage keys once a provider/storage is connected.
 */
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    legalName: { type: String, required: true, maxlength: 160 },
    dateOfBirth: { type: String, required: true }, // ISO date string
    country: { type: String, required: true, maxlength: 2 },
    idType: { type: String, enum: ["passport", "national_id", "drivers_licence", "residence_permit"], required: true },
    documentRefs: { type: [String], default: [] },
    provider: String,
    providerRef: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewNote: { type: String, maxlength: 1000 },
  },
  { timestamps: true },
);
export interface KycDoc {
  _id: Types.ObjectId; userId: Types.ObjectId; legalName: string; dateOfBirth: string; country: string;
  idType: string; documentRefs: string[]; status: string; reviewNote?: string; createdAt: Date;
}
export const KycSubmission: Model<KycDoc> = (models.KycSubmission as Model<KycDoc>) || model<KycDoc>("KycSubmission", schema);
