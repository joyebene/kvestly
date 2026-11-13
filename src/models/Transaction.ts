import mongoose, { Schema, models, model } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "investment",
        "profit",
        "admin_topup",
      ],
      required: true,
    },

    amountUSD: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceBeforeUSD: {
      type: Number,
      required: true,
    },

    balanceAfterUSD: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

export const Transaction =
  models.Transaction ||
  model("Transaction", TransactionSchema);