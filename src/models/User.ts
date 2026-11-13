import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ROLES } from "@/lib/rbac";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    emailVerifiedAt: { type: Date, default: null },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 32 },
    country: { type: String, trim: true, maxlength: 2 }, // ISO-3166 alpha-2
    role: { type: String, enum: ROLES, default: "client", index: true },
    status: { type: String, enum: ["active", "suspended", "closed"], default: "active" },
    kycStatus: { type: String, enum: ["not_started", "pending", "approved", "rejected"], default: "not_started" },
    failedLogins: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    mfa: {
      enabled: { type: Boolean, default: false },
      secretEnc: { type: String, select: false },
      pendingSecretEnc: { type: String, select: false },
      backupCodeHashes: { type: [String], select: false, default: [] },
      lastStep: { type: Number, select: false, default: 0 }, // TOTP replay protection
    },
    consent: {
      termsAcceptedAt: Date,
      privacyAcceptedAt: Date,
      riskAcknowledgedAt: Date,
      documentVersion: String,
    },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: import("mongoose").Types.ObjectId };
export const User: Model<UserDoc> = (models.User as Model<UserDoc>) || model<UserDoc>("User", userSchema);
