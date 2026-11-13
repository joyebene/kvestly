import { Schema, model, models, type Model, Types } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 254 },
    phone: { type: String, maxlength: 32 },
    subject: { type: String, required: true, maxlength: 160 },
    message: { type: String, required: true, maxlength: 5000 },
    status: { type: String, enum: ["new", "in_progress", "resolved", "spam"], default: "new", index: true },
    ipHash: String,
    handledBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
export interface ContactDoc {
  _id: Types.ObjectId; name: string; email: string; phone?: string; subject: string; message: string;
  status: string; createdAt: Date; ipHash?: string; handledBy?: Types.ObjectId;
}
export const ContactMessage: Model<ContactDoc> =
  (models.ContactMessage as Model<ContactDoc>) || model<ContactDoc>("ContactMessage", schema);
