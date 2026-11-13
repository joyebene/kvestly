import { Schema, model, models, type Model, Types } from "mongoose";

const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, maxlength: 160 },
    status: { type: String, enum: ["open", "awaiting_client", "resolved"], default: "open", index: true },
    messages: [
      {
        from: { type: String, enum: ["client", "staff"], required: true },
        authorId: { type: Schema.Types.ObjectId, ref: "User" },
        body: { type: String, required: true, maxlength: 4000 },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);
export interface TicketDoc {
  _id: Types.ObjectId; userId: Types.ObjectId; subject: string; status: string;
  messages: { from: "client" | "staff"; body: string; at: Date }[]; createdAt: Date; updatedAt: Date;
}
export const SupportTicket: Model<TicketDoc> = (models.SupportTicket as Model<TicketDoc>) || model<TicketDoc>("SupportTicket", schema);
