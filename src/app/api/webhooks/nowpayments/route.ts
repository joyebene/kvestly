
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { connectDb } from "@/lib/db";
import { InvestmentPayment } from "@/models/InvestmentPayment";

type NowPaymentsWebhook = {
  payment_id: string | number;
  payment_status: string;
  pay_address?: string;
  price_amount?: number;
  price_currency?: string;
  pay_amount?: number;
  actually_paid?: number;
  pay_currency?: string;
  order_id?: string;
  purchase_id?: string | number;
  payin_hash?: string;
};

const currencyMap: Record<string, string> = {
  "BTC_BITCOIN": "btc",
  "ETH_ETHEREUM": "eth",
  "TRX_TRON": "trx",
  "BNB_BSC": "bnbbsc",
  "USDT_TRON": "usdttrc20",
  "USDT_ETHEREUM": "usdterc20",
  "USDT_BSC": "usdtbsc",
};

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};

    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortObject(
        (value as Record<string, unknown>)[key]
      );
    }

    return sorted;
  }

  return value;
}

function verifySignature(
  payload: unknown,
  receivedSignature: string,
  secret: string
): boolean {
  const sortedPayload = JSON.stringify(sortObject(payload));

  const expectedSignature = createHmac("sha512", secret)
    .update(sortedPayload)
    .digest("hex");

  const received = Buffer.from(receivedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (received.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

function mapPaymentStatus(
  status: string
):
  | "waiting"
  | "confirming"
  | "confirmed"
  | "sending"
  | "finished"
  | "partially_paid"
  | "expired"
  | "failed"
  | "refunded"
  | null {
  switch (status.toLowerCase()) {
    case "waiting":
      return "waiting";

    case "confirming":
      return "confirming";

    case "confirmed":
      return "confirmed";

    case "sending":
      return "sending";

    case "finished":
      return "finished";

    case "partially_paid":
      return "partially_paid";

    case "expired":
      return "expired";

    case "failed":
      return "failed";

    case "refunded":
      return "refunded";

    default:
      return null;
  }
}

export async function POST(req: Request) {
  try {
    const secret = process.env.NOWPAYMENTS_IPN_SECRET;

    if (!secret) {
      console.error("NOWPAYMENTS_IPN_SECRET is missing.");

      return NextResponse.json(
        { error: "Webhook configuration error." },
        { status: 500 }
      );
    }

    // Read the incoming callback.
    const signature = req.headers.get("x-nowpayments-sig");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature." },
        { status: 401 }
      );
    }

    const rawBody = await req.text();

    if (!rawBody) {
      return NextResponse.json(
        { error: "Empty webhook request." },
        { status: 400 }
      );
    }

    let payload: NowPaymentsWebhook;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    // Verify authenticity before trusting any payment information.
    if (!verifySignature(payload, signature, secret)) {
      console.error("NOWPayments webhook signature verification failed.");

      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    if (
      payload.payment_id === undefined ||
      !payload.payment_status ||
      !payload.order_id
    ) {
      return NextResponse.json(
        { error: "Incomplete payment notification." },
        { status: 400 }
      );
    }

    const providerPaymentId = String(payload.payment_id);

    const incomingStatus = mapPaymentStatus(
      payload.payment_status
    );

    if (!incomingStatus) {
      console.warn(
        "Unknown NOWPayments status:",
        payload.payment_status
      );

      return NextResponse.json({
        received: true,
        message: "Unknown payment status ignored.",
      });
    }

    await connectDb();

    // Find the exact payment, not just the investment.
    const payment = await InvestmentPayment.findOne({
      provider: "nowpayments",
      providerPaymentId,
      investmentId: payload.order_id,
    });

    if (!payment) {
      console.error(
        "NOWPayments payment not found:",
        providerPaymentId
      );

      return NextResponse.json(
        { error: "Payment record not found." },
        { status: 404 }
      );
    }

    // Ensure the notification belongs to the expected deposit.
    const expectedCurrency =
      currencyMap[
        `${payment.cryptoCurrency}_${payment.cryptoNetwork}`
      ];

    if (
      !expectedCurrency ||
      payload.pay_currency?.toLowerCase() !== expectedCurrency
    ) {
      console.error("Payment currency mismatch:", providerPaymentId);

      return NextResponse.json(
        { error: "Payment currency mismatch." },
        { status: 400 }
      );
    }

    if (
      payload.pay_address &&
      payload.pay_address !== payment.payAddress
    ) {
      console.error("Payment address mismatch:", providerPaymentId);

      return NextResponse.json(
        { error: "Payment address mismatch." },
        { status: 400 }
      );
    }

    if (
      typeof payload.price_amount === "number" &&
      Math.abs(payload.price_amount - payment.priceAmount) > 0.01
    ) {
      console.error("Payment amount mismatch:", providerPaymentId);

      return NextResponse.json(
        { error: "Payment amount mismatch." },
        { status: 400 }
      );
    }

    // Do not allow repeated notifications to overwrite a final status.
    if (
      ["finished", "refunded", "late_payment"].includes(
        payment.paymentStatus
      )
    ) {
      return NextResponse.json({
        received: true,
        message: "Payment was already processed.",
      });
    }

    const actuallyPaid =
      typeof payload.actually_paid === "number"
        ? payload.actually_paid
        : payment.actuallyPaid;

    // If the payment completes after our deadline, flag it for manual review.
    const isLate =
      new Date() > payment.expiresAt &&
      ["finished", "partially_paid"].includes(incomingStatus);

    if (isLate) {
      payment.paymentStatus = "late_payment";
    } else {
      payment.paymentStatus = incomingStatus;
    }

    payment.actuallyPaid = actuallyPaid;

    if (payload.payin_hash) {
      payment.transactionHash = payload.payin_hash;
    }

    if (incomingStatus === "finished" && !isLate) {
      payment.paidAt = new Date();
    }

    await payment.save();

    console.log("NOWPayments payment updated:", {
      paymentId: providerPaymentId,
      status: payment.paymentStatus,
      amountPaid: payment.actuallyPaid,
    });

    return NextResponse.json({
      received: true,
      message: "Payment notification processed successfully.",
    });
  } catch (error) {
    console.error("NOWPayments webhook error:", error);

    return NextResponse.json(
      { error: "Unable to process payment notification." },
      { status: 500 }
    );
  }
}
