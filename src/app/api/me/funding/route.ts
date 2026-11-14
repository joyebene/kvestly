
import mongoose from "mongoose";

import { handle } from "@/lib/api";
import { fundingSchema, toMinor } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { connectDb } from "@/lib/db";

import { FundingRequest } from "@/models/FundingRequest";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";

export const POST = handle(
  {
    auth: "user",
    schema: fundingSchema,
    limit: ["funding", 10, 3600],
  },
  async ({ user, body, req }) => {
    // This endpoint accepts withdrawals only.
    if (body.kind !== "withdrawal") {
      throw new HttpError(
        422,
        "Only withdrawal requests are accepted.",
        "validation"
      );
    }

    await connectDb();

    const amountMinor = toMinor(body.amount);

    if (amountMinor < 1) {
      throw new HttpError(
        422,
        "Enter a valid withdrawal amount.",
        "validation",
        { amount: "Enter a valid withdrawal amount." }
      );
    }

    // Your User.balance and Transaction.amountUSD are in USD.
    const amountUSD = amountMinor / 100;

    const session = await mongoose.startSession();

    let requestId = "";

    try {
      await session.withTransaction(async () => {
        // Get the user's current balance.
        const currentUser = await User.findById(user.id)
          .session(session);

        if (!currentUser) {
          throw new HttpError(
            404,
            "User account not found.",
            "user_not_found"
          );
        }

        const balanceBeforeUSD = Number(currentUser.balance || 0);

        // Check available balance.
        if (balanceBeforeUSD < amountUSD) {
          throw new HttpError(
            422,
            "Insufficient balance for this withdrawal.",
            "insufficient_balance",
            {
              amount: "Your available balance is insufficient."
            }
          );
        }

        // Deduct balance atomically.
        const updatedUser = await User.findOneAndUpdate(
          {
            _id: user.id,
            balance: { $gte: amountUSD },
          },
          {
            $inc: { balance: -amountUSD },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedUser) {
          throw new HttpError(
            422,
            "Insufficient balance. Please try again.",
            "insufficient_balance"
          );
        }

        const balanceAfterUSD = Number(updatedUser.balance);

        // Create pending withdrawal request.
        const withdrawal = new FundingRequest({
          userId: user.id,
          kind: "withdrawal",
          amountMinor,
          currency: "USD",
          userNote: body.note,
          status: "pending",
        });

        await withdrawal.save({ session });

        requestId = String(withdrawal._id);

        // Create pending transaction.
        const transaction = new Transaction({
          userId: user.id,
          type: "withdrawal",
          amountUSD,
          balanceBeforeUSD,
          balanceAfterUSD,
          description: `Withdrawal request #${requestId}`,
          status: "pending",
        });

        await transaction.save({ session });
      });

    } finally {
      await session.endSession();
    }

    // Record the audit event after the financial transaction commits.
    await audit({
      action: "funding.withdrawal.request",
      actor: {
        id: user.id,
        role: user.role,
      },
      target: {
        type: "funding",
        id: requestId,
      },
      meta: {
        amountMinor,
        amountUSD,
        status: "pending",
      },
      headers: req.headers,
    });

    return {
      ok: true,
      id: requestId,
      message: "Withdrawal request submitted successfully.",
    };
  }
);
