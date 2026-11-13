import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IAuditLog {
  _id: Types.ObjectId;
  actorId?: Types.ObjectId;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipHash?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorEmail: { type: String },
    actorRole: { type: String },
    action: { type: String, required: true, index: true },
    targetType: { type: String },
    targetId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipHash: { type: String },
    userAgent: { type: String, maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

/**
 * Append-only: audit records can be created but never modified or removed
 * through the application. (Also enforce with a restricted DB role in production.)
 */
const blocked = [
  "updateOne",
  "updateMany",
  "findOneAndUpdate",
  "findOneAndReplace",
  "replaceOne",
  "deleteOne",
  "deleteMany",
  "findOneAndDelete",
] as const;
for (const op of blocked) {
  auditSchema.pre(op, function () {
    throw new Error("AuditLog is append-only.");
  });
}
auditSchema.pre("save", function () {
  if (!this.isNew) throw new Error("AuditLog is append-only.");
});

export const AuditLog: Model<IAuditLog> =
  (mongoose.models.AuditLog as Model<IAuditLog> | undefined) ?? mongoose.model<IAuditLog>("AuditLog", auditSchema);
