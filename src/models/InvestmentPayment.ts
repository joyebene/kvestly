import { Schema, model, models, Types } from "mongoose";

type PaymentStatus =
  | "waiting"
  | "confirming"
  | "confirmed"
  | "sending"
  | "finished"
  | "partially_paid"
  | "expired"
  | "failed"
  | "refunded"
  | "late_payment";

export interface InvestmentPayment {
  _id: Types.ObjectId;
  investmentId: Types.ObjectId;
  userId: Types.ObjectId;

  provider: "nowpayments";
  providerPaymentId: string;

  cryptoCurrency: string;
  cryptoNetwork: string;

  payAddress: string;
  payAmount: number;
  actuallyPaid: number;

  priceAmount: number;
  priceCurrency: string;

  paymentStatus: PaymentStatus;

  expiresAt: Date;
  paidAt?: Date;

  transactionHash?: string;

  createdAt: Date;
  updatedAt: Date;
}

const InvestmentPaymentSchema =
  new Schema<InvestmentPayment>(
    {
      investmentId: {
        type: Schema.Types.ObjectId,
        ref: "InvestmentApplication",
        required: true,
        index: true,
      },

      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      provider: {
        type: String,
        enum: ["nowpayments"],
        default: "nowpayments",
        required: true,
      },

      providerPaymentId: {
        type: String,
        required: true,
        unique: true,
      },

      cryptoCurrency: {
        type: String,
        required: true,
      },

      cryptoNetwork: {
        type: String,
        required: true,
      },

      payAddress: {
        type: String,
        required: true,
      },

      payAmount: {
        type: Number,
        required: true,
      },

      actuallyPaid: {
        type: Number,
        default: 0,
      },

      priceAmount: {
        type: Number,
        required: true,
      },

      priceCurrency: {
        type: String,
        default: "usd",
        required: true,
      },

      paymentStatus: {
        type: String,
        enum: [
          "waiting",
          "confirming",
          "confirmed",
          "finished",
          "partially_paid",
          "expired",
          "failed",
          "late_payment",
        ],
        default: "waiting",
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },

      paidAt: Date,

      transactionHash: String,
    },
    {
      timestamps: true,
    }
  );

export const InvestmentPayment =
  models.InvestmentPayment ||
  model<InvestmentPayment>(
    "InvestmentPayment",
    InvestmentPaymentSchema
  );