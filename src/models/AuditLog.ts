import { Schema, model, models, type Model, Types } from "mongoose";
import { makeImmutable } from "./_helpers";

const schema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorRole: String,
    action: { type: String, required: true, index: true }, // e.g. "kyc.approve", "auth.login.failed"
    targetType: String,
    targetId: String,
    outcome: { type: String, enum: ["success", "denied", "failure"], default: "success" },
    ipHash: String,
    userAgent: { type: String, maxlength: 300 },
    meta: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
schema.index({ createdAt: -1 });
makeImmutable(schema);

export interface AuditDoc {
  _id: Types.ObjectId; actorId?: Types.ObjectId; actorRole?: string; action: string; targetType?: string;
  targetId?: string; outcome: string; ipHash?: string; userAgent?: string; meta?: unknown; createdAt: Date;
}
export const AuditLog: Model<AuditDoc> = (models.AuditLog as Model<AuditDoc>) || model<AuditDoc>("AuditLog", schema);
