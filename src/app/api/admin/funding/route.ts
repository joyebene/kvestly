
import { NextResponse } from "next/server";

import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";

import { FundingRequest } from "@/models/FundingRequest";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";

export async function GET() {
  try {
    // Require authorized admin access.
    await requireStaff("requests:review");

    await connectDb();

    // Fetch withdrawal requests only.
    const withdrawals = await FundingRequest.find({
      kind: "withdrawal",
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    if (withdrawals.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        withdrawals: [],
      });
    }

    const userIds = withdrawals.map((item) => item.userId);

    // Fetch associated users and withdrawal transactions.
    const [users, transactions] = await Promise.all([
      User.find({
        _id: { $in: userIds },
      })
        .select("fullName email phone balance")
        .lean(),

      Transaction.find({
        userId: { $in: userIds },
        type: "withdrawal",
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const userMap = new Map(
      users.map((user) => [
        String(user._id),
        user,
      ])
    );

    // Associate transactions with their withdrawal requests.
    const transactionMap = new Map<
      string,
      (typeof transactions)[number]
    >();

    for (const transaction of transactions) {
      const description = transaction.description ?? "";

      for (const withdrawal of withdrawals) {
        const requestId = String(withdrawal._id);

        if (
          description.includes(`#${requestId}`) &&
          !transactionMap.has(requestId)
        ) {
          transactionMap.set(requestId, transaction);
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: withdrawals.length,

      withdrawals: withdrawals.map((withdrawal) => {
        const user = userMap.get(String(withdrawal.userId));
        const transaction = transactionMap.get(
          String(withdrawal._id)
        );

        return {
          id: String(withdrawal._id),

          userId: String(withdrawal.userId),

          fullName: user?.fullName ?? "Unknown user",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
          currentBalance: user?.balance ?? 0,

          amountMinor: withdrawal.amountMinor,
          currency: withdrawal.currency,

          status: withdrawal.status,

          userNote: withdrawal.userNote ?? "",
          reviewNote: withdrawal.reviewNote ?? "",

        //   reviewedBy: withdrawal.reviewedBy
        //     ? String(withdrawal.reviewedBy)
        //     : null,

        //   reviewedAt: withdrawal.reviewedAt ?? null,

          transaction: transaction
            ? {
                id: String(transaction._id),
                amountUSD: transaction.amountUSD,
                balanceBeforeUSD: transaction.balanceBeforeUSD,
                balanceAfterUSD: transaction.balanceAfterUSD,
                status: transaction.status,
                description: transaction.description,
                createdAt: transaction.createdAt,
              }
            : null,

          createdAt: withdrawal.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error("Admin withdrawals fetch error:", error);

    return NextResponse.json(
      { error: "Unable to fetch withdrawal requests." },
      { status: 500 }
    );
  }
}
