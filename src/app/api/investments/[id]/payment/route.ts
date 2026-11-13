
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { InvestmentApplication } from "@/models/InvestmentApplication";
import { InvestmentPayment } from "@/models/InvestmentPayment";
import { isValidObjectId } from "mongoose";
import { Types } from "mongoose";

const currencyMap: Record<string, string> = {
  "BTC_BITCOIN": "btc",
  "ETH_ETHEREUM": "eth",
  "TRX_TRON": "trx",
  "BNB_BSC": "bnbbsc",
  "USDT_TRON": "usdttrc20",
  "USDT_ETHEREUM": "usdterc20",
  "USDT_BSC": "usdtbsc",
};

const ACTIVE_STATUSES = [
  "waiting",
  "confirming",
  "confirmed",
  "partially_paid",
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await requireUser();
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid investment ID." },
        { status: 400 }
      );
    }

    await connectDb();

    const investment = await InvestmentApplication.findOne({
      _id: id,
      userId: me.id,
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment application not found." },
        { status: 404 }
      );
    }

    if (investment.status !== "pending") {
      return NextResponse.json(
        { error: "This investment is no longer awaiting payment." },
        { status: 400 }
      );
    }

    const currencyKey =
      `${investment.cryptoCurrency}_${investment.cryptoNetwork}`;

    const payCurrency = currencyMap[currencyKey];

    if (!payCurrency) {
      return NextResponse.json(
        { error: "Unsupported cryptocurrency or network." },
        { status: 400 }
      );
    }

    // Reuse an existing unexpired payment instead of creating duplicates.
    const existingPayment = await InvestmentPayment.findOne({
      investmentId: investment._id,
      userId: me.id,
      paymentStatus: { $in: ACTIVE_STATUSES },
      expiresAt: { $gt: new Date() },
    });

    if (existingPayment) {
      return NextResponse.json({
        message: "An active payment already exists.",
        payment: {
          id: existingPayment._id,
          address: existingPayment.payAddress,
          amount: existingPayment.payAmount,
          currency: existingPayment.cryptoCurrency,
          network: existingPayment.cryptoNetwork,
          status: existingPayment.paymentStatus,
          expiresAt: existingPayment.expiresAt,
        },
      });
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!apiKey || !appUrl) {
      console.error("Missing NOWPayments environment configuration.");

      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 500 }
      );
    }

    const callbackUrl = `${appUrl.replace(/\/$/, "")}/api/webhooks/nowpayments`;

    const providerResponse = await fetch(
      "https://api.nowpayments.io/v1/payment",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_amount: investment.amountRequested,
          price_currency: "usd",
          pay_currency: payCurrency,
          ipn_callback_url: callbackUrl,
          order_id: investment._id.toString(),
          order_description: `Trust Chain Investment ${investment._id}`,
        }),
        cache: "no-store",
      }
    );

    const providerData = await providerResponse.json();

    if (!providerResponse.ok) {
      console.error("NOWPayments error:", providerData);

      return NextResponse.json(
        {
          error:
            providerData.message ||
            "Unable to create cryptocurrency payment.",
        },
        { status: 502 }
      );
    }

    if (
      !providerData.payment_id ||
      !providerData.pay_address ||
      !providerData.pay_amount
    ) {
      console.error("Incomplete NOWPayments response:", providerData);

      return NextResponse.json(
        { error: "Payment provider returned incomplete payment details." },
        { status: 502 }
      );
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const payment = await InvestmentPayment.create({
      investmentId: investment._id,
      userId: me.id,
      provider: "nowpayments",
      providerPaymentId: String(providerData.payment_id),
      cryptoCurrency: investment.cryptoCurrency,
      cryptoNetwork: investment.cryptoNetwork,
      payAddress: providerData.pay_address,
      payAmount: Number(providerData.pay_amount),
      actuallyPaid: 0,
      priceAmount: investment.amountRequested,
      priceCurrency: "usd",
      paymentStatus: "waiting",
      expiresAt,
    });

    return NextResponse.json(
      {
        message: "Payment created successfully.",
        payment: {
          id: payment._id,
          address: payment.payAddress,
          amount: payment.payAmount,
          currency: payment.cryptoCurrency,
          network: payment.cryptoNetwork,
          status: payment.paymentStatus,
          expiresAt: payment.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create payment error:", error);

    return NextResponse.json(
      { error: "Unable to create payment." },
      { status: 500 }
    );
  }
}


type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const me = await requireUser();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid investment ID." },
        { status: 400 }
      );
    }

    await connectDb();

    const payment = await InvestmentPayment.findOne({
      investmentId: id,
      userId: me.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!payment) {
      return NextResponse.json(
        { error: "No payment found for this investment." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      payment: {
        id: payment._id.toString(),
        investmentId: payment.investmentId.toString(),
        amount: payment.payAmount,
        currency: payment.cryptoCurrency,
        network: payment.cryptoNetwork,
        address: payment.payAddress,
        actuallyPaid: payment.actuallyPaid,
        status: payment.paymentStatus,
        expiresAt: payment.expiresAt,
        paidAt: payment.paidAt ?? null,
        transactionHash: payment.transactionHash ?? null,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Payment status error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve payment status." },
      { status: 500 }
    );
  }
}

