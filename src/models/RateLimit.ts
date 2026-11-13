import { Schema, model, models, type Model } from "mongoose";

const schema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit: Model<{ key: string; count: number; expiresAt: Date }> =
  (models.RateLimit as never) || model("RateLimit", schema);
