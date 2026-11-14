
import mongoose from "mongoose";
import { z } from "zod";

import { handle } from "@/lib/api";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { connectDb } from "@/lib/db";

import { FundingRequest } from "@/models/FundingRequest";
import { Notification } from "@/models/Notification";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";

const schema = z.object({
  status: z.enum(["under_review", "approved", "rejected"]),
  note: z.string().trim().max(1000).optional(),
});

const FLOW: Record<string, string[]> = {
  pending: ["under_review", "approved", "rejected"],
  under_review: ["approved", "rejected"],
};

export const POST = handle(
  {
    auth: { permission: "requests:review" },
    schema,
    limit: ["admin-funding", 60, 3600],
  },
  async ({ user, body, params, req }) => {
    if (!/^[a-f0-9]{24}$/i.test(params.id)) {
      throw new HttpError(404, "Not found.", "not_found");
    }

    if (body.status === "rejected" && !body.note) {
      throw new HttpError(
        422,
        "Give a reason for rejection.",
        "validation",
        { note: "A reason is required." }
      );
    }

    await connectDb();

    const session = await mongoose.startSession();

    let withdrawalUserId = "";
    let withdrawalAmount = 0;

    try {
      await session.withTransaction(async () => {
        // Fetch withdrawal request only.
        const r = await FundingRequest.findOne({
          _id: params.id,
          kind: "withdrawal",
        }).session(session);

        if (!r) {
          throw new HttpError(
            404,
            "Withdrawal request not found.",
            "not_found"
          );
        }

        // Validate status transition.
        if (!FLOW[r.status]?.includes(body.status)) {
          throw new HttpError(
            409,
            `A ${r.status} withdrawal cannot move to ${body.status}.`,
            "bad_transition"
          );
        }

        // Find the associated transaction only when a financial
        // decision is being made.
        let transaction = null;

        if (body.status === "approved" || body.status === "rejected") {
          transaction = await Transaction.findOne({
            userId: r.userId,
            type: "withdrawal",
            description: {
              $in: [
                `Withdrawal request #${r._id}`,
              ],
            },
            status: "pending",
          }).session(session);

          if (!transaction) {
            throw new HttpError(
              409,
              "Associated pending withdrawal transaction not found.",
              "transaction_not_found"
            );
          }
        }

        // Refund only when the withdrawal is rejected.
        if (body.status === "rejected" && transaction) {
          const refund = await User.updateOne(
            { _id: r.userId },
            { $inc: { balance: transaction.amountUSD } },
            { session }
          );

          if (refund.modifiedCount !== 1) {
            throw new HttpError(
              404,
              "User account not found. Refund could not be processed.",
              "user_not_found"
            );
          }
        }

        // Update withdrawal request.
        const updated = await FundingRequest.updateOne(
          {
            _id: r._id,
            kind: "withdrawal",
            status: r.status,
          },
          {
            $set: {
              status: body.status,
              reviewedBy: user.id,
              reviewedAt: new Date(),
              reviewNote: body.note ?? "",
            },
          },
          { session }
        );

        if (updated.modifiedCount !== 1) {
          throw new HttpError(
            409,
            "Withdrawal request has already been updated.",
            "bad_transition"
          );
        }

        // Only complete or fail the transaction for final decisions.
        if (transaction && (
          body.status === "approved" ||
          body.status === "rejected"
        )) {
          const transactionUpdate = await Transaction.updateOne(
            {
              _id: transaction._id,
              status: "pending",
            },
            {
              $set: {
                status:
                  body.status === "approved" ? "completed" : "failed",

                description:
                  body.status === "approved"
                    ? `Withdrawal approved #${r._id}`
                    : `Withdrawal rejected and refunded #${r._id}`,

                ...(body.status === "rejected"
                  ? {
                      balanceAfterUSD:
                        transaction.balanceAfterUSD +
                        transaction.amountUSD,
                    }
                  : {}),
              },
            },
            { session }
          );

          if (transactionUpdate.modifiedCount !== 1) {
            throw new HttpError(
              409,
              "Withdrawal transaction has already been processed.",
              "transaction_processed"
            );
          }
        }

        withdrawalUserId = String(r.userId);
        withdrawalAmount = transaction?.amountUSD ?? 0;
      });

    } finally {
      await session.endSession();
    }

    // Audit after successful financial processing.
    await audit(
      {
        action: `funding.withdrawal.${body.status}`,
        actor: {
          id: user.id,
          role: user.role,
        },
        target: {
          type: "funding",
          id: params.id,
        },
        meta: {
          status: body.status,
          note: body.note,
          amountUSD: withdrawalAmount,
        },
        headers: req.headers,
      },
      { critical: true }
    );

    // Notify user.
    await Notification.create({
      userId: withdrawalUserId,
      kind: "account",
      title: `Your withdrawal request is ${body.status.replace("_", " ")}`,
      body:
        body.note ??
        (body.status === "approved"
          ? "Your withdrawal has been approved."
          : body.status === "rejected"
            ? "Your withdrawal was rejected and your balance has been refunded."
            : "Your withdrawal is being reviewed."),
    });

    return {
      ok: true,
      message: `Withdrawal ${body.status.replace("_", " ")} successfully.`,
    };
  }
);
