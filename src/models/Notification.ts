import { Schema, model, models, type Model, Types } from "mongoose";

const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: ["account", "security", "kyc", "investment", "announcement"], default: "account" },
    title: { type: String, required: true, maxlength: 160 },
    body: { type: String, required: true, maxlength: 2000 },
    readAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
export interface NotificationDoc { _id: Types.ObjectId; userId: Types.ObjectId; kind: string; title: string; body: string; readAt?: Date; createdAt: Date; createdBy?: Types.ObjectId }
export const Notification: Model<NotificationDoc> = (models.Notification as Model<NotificationDoc>) || model<NotificationDoc>("Notification", schema);
