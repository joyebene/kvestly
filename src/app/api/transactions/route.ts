
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { Transaction } from "@/models/Transaction";

export async function GET() {
  try {
    const user = await requireUser();

    await connectDb();

    const transactions = await Transaction.find({
      userId: user.id,
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions: transactions.map((transaction) => ({
        id: String(transaction._id),
        type: transaction.type,
        amountUSD: transaction.amountUSD,
        balanceBeforeUSD: transaction.balanceBeforeUSD,
        balanceAfterUSD: transaction.balanceAfterUSD,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt,
      })),
    });
  } catch (error) {
    console.error("Fetch transactions error:", error);

    return NextResponse.json(
      { error: "Unable to fetch transactions." },
      { status: 500 }
    );
  }
}
