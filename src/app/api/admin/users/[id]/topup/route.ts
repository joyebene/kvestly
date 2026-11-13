
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { z } from "zod";

const topupSchema = z.object({
  amount: z.coerce.number().positive().finite(),
  note: z.string().max(500).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await requireStaff("users:manage");
    await connectDb();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: { message: "Invalid user ID." } },
        { status: 400 }
      );
    }

    const body = await req.json();
    const result = topupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, note } = result.data;

    // Limit to two decimal places.
    const creditAmount = Math.round(amount * 100) / 100;

    if (!Number.isFinite(creditAmount) || creditAmount <= 0) {
      return NextResponse.json(
        { error: { message: "Invalid top-up amount." } },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: { message: "User not found." } },
        { status: 404 }
      );
    }

    const balanceBefore = user.balance;
    user.balance = Math.round((balanceBefore + creditAmount) * 100) / 100;

    await user.save();

    await AuditLog.create({
      actorId: me.id,
      actorRole: me.role,
      action: "user.topup",
      targetType: "user",
      targetId: user._id.toString(),
      outcome: "success",
      meta: {
        amount: creditAmount,
        note: note?.trim() || "Manual wallet top-up",
        balanceBefore,
        balanceAfter: user.balance,
      },
    });

    return NextResponse.json({
      message: "Wallet topped up successfully.",
      data: {
        amount: creditAmount,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error("Wallet top-up error:", error);

    return NextResponse.json(
      { error: { message: "Unable to process wallet top-up." } },
      { status: 500 }
    );
  }
}
