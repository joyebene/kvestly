
import { Schema, model, models, Types } from "mongoose";

export type InvestmentCrypto = "BTC" | "ETH" | "TRX" | "BNB" | "USDT";

export type CryptoNetwork =
  | "BITCOIN"
  | "ETHEREUM"
  | "TRON"
  | "BSC";

export interface InvestmentApplication {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amountRequested: number;
  amountApproved?: number;
  cryptoCurrency: InvestmentCrypto;
  cryptoNetwork: CryptoNetwork;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentApplicationSchema =
  new Schema<InvestmentApplication>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      amountRequested: {
        type: Number,
        required: true,
        min: 0.01,
      },

      amountApproved: {
        type: Number,
        min: 0,
      },

      cryptoCurrency: {
        type: String,
        enum: ["BTC", "ETH", "TRX", "BNB", "USDT"],
        required: true,
      },
      cryptoNetwork: {
        type: String,
        enum: ["BITCOIN", "ETHEREUM", "TRON", "BSC"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        required: true,
      },

      adminNotes: {
        type: String,
      },
    },
    { timestamps: true }
  );

export const InvestmentApplication =
  models.InvestmentApplication ||
  model<InvestmentApplication>(
    "InvestmentApplication",
    InvestmentApplicationSchema
  );
