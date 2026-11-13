import mongoose, { Schema, type Model, type Types } from "mongoose";

/* ───────────── Contact messages ───────────── */
export interface IContactMessage {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  ipHash?: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: Date;
}

const contactSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, maxlength: 254 },
    phone: { type: String, maxlength: 30 },
    subject: { type: String, required: true, maxlength: 150 },
    message: { type: String, required: true, maxlength: 5000 },
    ipHash: { type: String },
    status: { type: String, enum: ["new", "read", "replied", "archived"], default: "new", index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ContactMessage: Model<IContactMessage> =
  (mongoose.models.ContactMessage as Model<IContactMessage> | undefined) ??
  mongoose.model<IContactMessage>("ContactMessage", contactSchema);

/* ───────────── KYC submissions ─────────────
   Stores only references to documents held by a verified KYC provider or
   encrypted object storage. Raw identity documents are never stored in MongoDB. */
export interface IKycSubmission {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  providerName?: string;
  providerReference?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  decisionNote?: string;
  createdAt: Date;
}

const kycSchema = new Schema<IKycSubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    providerName: { type: String, maxlength: 80 },
    providerReference: { type: String, maxlength: 200 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    decisionNote: { type: String, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const KycSubmission: Model<IKycSubmission> =
  (mongoose.models.KycSubmission as Model<IKycSubmission> | undefined) ??
  mongoose.model<IKycSubmission>("KycSubmission", kycSchema);

/* ───────────── Notifications ───────────── */
export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  body: string;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, maxlength: 140 },
    body: { type: String, required: true, maxlength: 2000 },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification> | undefined) ??
  mongoose.model<INotification>("Notification", notificationSchema);
