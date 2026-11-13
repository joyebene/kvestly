import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ISession {
  jti: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  revokedAt?: Date;
  userAgent?: string;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    jti: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    userAgent: { type: String, maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
// MongoDB removes expired sessions automatically.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel: Model<ISession> =
  (mongoose.models.Session as Model<ISession> | undefined) ?? mongoose.model<ISession>("Session", sessionSchema);
