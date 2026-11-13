import { Schema, model, models, type Model, Types } from "mongoose";

const schema = new Schema(
  {
    key: { type: String, required: true, unique: true, maxlength: 80 },
    title: { type: String, required: true, maxlength: 160 },
    body: { type: String, required: true, maxlength: 6000 },
    published: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
export interface ContentDoc { _id: Types.ObjectId; key: string; title: string; body: string; published: boolean; updatedAt: Date }
export const ContentBlock: Model<ContentDoc> = (models.ContentBlock as Model<ContentDoc>) || model<ContentDoc>("ContentBlock", schema);
