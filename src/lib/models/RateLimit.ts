import mongoose, { Schema, type Model } from "mongoose";

export interface IRateLimit {
  key: string;
  count: number;
  expiresAt: Date;
}

const rateLimitSchema = new Schema<IRateLimit>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitModel: Model<IRateLimit> =
  (mongoose.models.RateLimit as Model<IRateLimit> | undefined) ??
  mongoose.model<IRateLimit>("RateLimit", rateLimitSchema);
