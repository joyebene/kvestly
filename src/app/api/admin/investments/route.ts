
import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { InvestmentApplication } from "@/models/InvestmentApplication";
import { InvestmentPayment } from "@/models/InvestmentPayment";
import { User } from "@/models/User";
import { can } from "@/lib/rbac";

export async function GET() {
  try {
    await requireStaff("investments:read");
    await connectDb();

    const applications = await InvestmentApplication.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const userIds = applications.map((item) => item.userId);
    const investmentIds = applications.map((item) => item._id);

    const [users, payments] = await Promise.all([
      User.find({ _id: { $in: userIds } })
        .select("fullName email balance")
        .lean(),

      InvestmentPayment.find({
        investmentId: { $in: investmentIds },
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const userMap = new Map(
      users.map((user) => [String(user._id), user])
    );

    const paymentMap = new Map<string, (typeof payments)[number]>();

    for (const payment of payments) {
      const id = String(payment.investmentId);

      if (!paymentMap.has(id)) {
        paymentMap.set(id, payment);
      }
    }

    return NextResponse.json({
      success: true,
      investments: applications.map((application) => {
        const user = userMap.get(String(application.userId));
        const payment = paymentMap.get(String(application._id));

        return {
          id: String(application._id),
          userId: String(application.userId),
          fullName: user?.fullName ?? "Unknown user",
          email: user?.email ?? "",
          currentBalance: user?.balance ?? 0,

          amountRequested: application.amountRequested,
          amountApproved: application.amountApproved ?? null,

          cryptoCurrency: application.cryptoCurrency,
          cryptoNetwork: application.cryptoNetwork,

          status: application.status,
          adminNotes: application.adminNotes ?? "",

          payment: payment
            ? {
                id: String(payment._id),
                providerPaymentId: payment.providerPaymentId,
                payAmount: payment.payAmount,
                actuallyPaid: payment.actuallyPaid,
                priceAmount: payment.priceAmount,
                priceCurrency: payment.priceCurrency,
                paymentStatus: payment.paymentStatus,
                transactionHash: payment.transactionHash ?? null,
                paidAt: payment.paidAt ?? null,
                createdAt: payment.createdAt,
              }
            : null,

          createdAt: application.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error("Admin investments fetch error:", error);

    return NextResponse.json(
      { error: "Unable to fetch investment applications." },
      { status: 500 }
    );
  }
}
