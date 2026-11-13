import mongoose, { Schema, type Model, type Types } from "mongoose";

export const ROLES = ["client", "support", "compliance", "finance", "admin", "superadmin"] as const;
export type Role = (typeof ROLES)[number];


export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  status: "active" | "suspended";
  emailVerified: boolean;
  mfaEnabled: boolean;
  virtualWalletAddress?: string;
  mfaSecretEnc?: string;
  mfaPendingSecretEnc?: string;
  mfaLastStep: number;
  recoveryCodeHashes: string[];
  failedLogins: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, trim: true, maxlength: 30 },
    // Sensitive fields are excluded from queries unless explicitly selected.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "client", index: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    emailVerified: { type: Boolean, default: false },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecretEnc: { type: String, select: false },
    virtualWalletAddress: { type: String, select: false },
    mfaPendingSecretEnc: { type: String, select: false },
    mfaLastStep: { type: Number, default: 0, select: false },
    recoveryCodeHashes: { type: [String], default: [], select: false },
    failedLogins: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, select: false },
    lastLoginAt: { type: Date },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser> | undefined) ?? mongoose.model<IUser>("User", userSchema);