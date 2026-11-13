import { Schema, model, models, type Model, Types } from "mongoose";

const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    mfaVerified: { type: Boolean, default: false },
    ipHash: String,
    userAgent: { type: String, maxlength: 300 },
    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL cleanup

export interface SessionDoc {
  _id: Types.ObjectId; userId: Types.ObjectId; tokenHash: string; mfaVerified: boolean;
  ipHash?: string; userAgent?: string; lastUsedAt: Date; expiresAt: Date;
}
export const Session: Model<SessionDoc> = (models.Session as Model<SessionDoc>) || model<SessionDoc>("Session", schema);
