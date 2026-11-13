
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { can } from "@/lib/rbac";

import { InvestmentApplication } from "@/models/InvestmentApplication";
import { InvestmentPayment } from "@/models/InvestmentPayment";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";

const decisionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  amountApproved: z.number().positive().optional(),
  note: z.string().max(1000).optional(),
}).superRefine((data, ctx) => {
  if (data.status === "approved" && !data.amountApproved) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter the approved amount.",
      path: ["amountApproved"],
    });
  }

  if (data.status === "rejected" && !data.note?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A rejection reason is required.",
      path: ["note"],
    });
  }
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  req: Request,
  { params }: RouteContext
) {
  let session: mongoose.ClientSession | undefined;

  try {
    const staff = await requireStaff("investments:review");

    await connectDb();

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid investment ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = decisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, amountApproved, note } = parsed.data;

    session = await mongoose.startSession();

    let result: {
      status: string;
      amountApproved?: number;
    } | null = null;

    await session.withTransaction(async () => {
      const investment = await InvestmentApplication.findById(id)
        .session(session!);

      if (!investment) {
        throw new Error("INVESTMENT_NOT_FOUND");
      }

      if (investment.status !== "pending") {
        throw new Error("INVESTMENT_ALREADY_PROCESSED");
      }

      if (status === "rejected") {
        investment.status = "rejected";
        investment.adminNotes = note?.trim() || "Rejected by admin.";

        await investment.save({ session });

        result = { status: "rejected" };
        return;
      }

      // Only successfully completed NOWPayments payments qualify.
      const payment = await InvestmentPayment.findOne({
        investmentId: investment._id,
        userId: investment.userId,
        paymentStatus: "finished",
      })
        .sort({ createdAt: -1 })
        .session(session!);

      if (!payment) {
        throw new Error("PAYMENT_NOT_FINISHED");
      }

      if (
        !Number.isFinite(amountApproved) ||
        !amountApproved ||
        amountApproved <= 0
      ) {
        throw new Error("INVALID_APPROVED_AMOUNT");
      }

      // Do not credit more than the verified USD payment amount.
      const paidUsd = payment.actuallyPaid;

      if (
        !Number.isFinite(paidUsd) ||
        paidUsd <= 0 ||
        amountApproved > paidUsd + 0.01
      ) {
        throw new Error("APPROVED_AMOUNT_EXCEEDS_PAYMENT");
      }

      const user = await User.findById(investment.userId)
        .session(session!);

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      const balanceBefore = user.balance;

      // Update client balance.
      user.balance = balanceBefore + amountApproved;
      await user.save({ session });

      // Record the deposit in the transaction ledger.
      await Transaction.create(
        [
          {
            userId: user._id,
            type: "deposit",
            amountUSD: amountApproved,
            balanceBeforeUSD: balanceBefore,
            balanceAfterUSD: user.balance,
            description: `Approved crypto investment deposit (${payment.cryptoCurrency} on ${payment.cryptoNetwork}). Payment reference: ${payment.providerPaymentId}`,
            performedBy: staff.id,
            status: "completed",
          },
        ],
        { session }
      );

      investment.status = "approved";
      investment.amountApproved = amountApproved;
      investment.adminNotes = note?.trim() || "Approved by admin.";

      await investment.save({ session });

      result = {
        status: "approved",
        amountApproved,
      };
    });

    return NextResponse.json({
      success: true,
      message:
        result?.status === "approved"
          ? "Investment approved and client balance credited successfully."
          : "Investment rejected successfully.",
      result,
    });
  } catch (error) {
    console.error("Investment decision error:", error);

    const message =
      error instanceof Error ? error.message : "";

    const errors: Record<string, { status: number; message: string }> = {
      INVESTMENT_NOT_FOUND: {
        status: 404,
        message: "Investment application not found.",
      },
      INVESTMENT_ALREADY_PROCESSED: {
        status: 409,
        message: "This investment has already been processed.",
      },
      PAYMENT_NOT_FINISHED: {
        status: 400,
        message: "Cannot approve: NOWPayments has not marked the payment as finished.",
      },
      INVALID_APPROVED_AMOUNT: {
        status: 400,
        message: "Enter a valid approved amount.",
      },
      APPROVED_AMOUNT_EXCEEDS_PAYMENT: {
        status: 400,
        message: "Approved amount cannot exceed the verified USD payment amount.",
      },
      USER_NOT_FOUND: {
        status: 404,
        message: "Client account not found.",
      },
    };

    const known = errors[message];

    return NextResponse.json(
      {
        error: known?.message ?? "Unable to process investment decision.",
      },
      { status: known?.status ?? 500 }
    );
  } finally {
    await session?.endSession();
  }
}
