import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { InvestmentApplication } from "@/models/InvestmentApplication";
import { z } from "zod";

const investmentApplicationSchema = z
  .object({
    amountRequested: z.number().positive(),

    cryptoCurrency: z.enum([
      "BTC",
      "ETH",
      "TRX",
      "BNB",
      "USDT",
    ]),

    cryptoNetwork: z.enum([
      "BITCOIN",
      "ETHEREUM",
      "TRON",
      "BSC",
    ]),
  })
  .refine(
    (data) => {
      const validNetworks: Record<string, string[]> = {
        BTC: ["BITCOIN"],
        ETH: ["ETHEREUM"],
        TRX: ["TRON"],
        BNB: ["BSC"],
        USDT: ["TRON", "ETHEREUM", "BSC"],
      };

      return validNetworks[data.cryptoCurrency]?.includes(
        data.cryptoNetwork
      );
    },
    {
      message: "Invalid network for the selected cryptocurrency.",
      path: ["cryptoNetwork"],
    }
  );

export async function POST(req: Request) {
  try {
    const me = await requireUser();

    const body = await req.json();

    const result = investmentApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await connectDb();

    // Extract all three validated values.
    const {
      amountRequested,
      cryptoCurrency,
      cryptoNetwork,
    } = result.data;

    const investment = await InvestmentApplication.create({
      userId: me.id,
      amountRequested,
      cryptoCurrency,
      cryptoNetwork,
      status: "pending",
    });

    return NextResponse.json(
      {
        message: "Investment application created successfully.",
        investment: {
          id: investment._id,
          amountRequested: investment.amountRequested,
          cryptoCurrency: investment.cryptoCurrency,
          cryptoNetwork: investment.cryptoNetwork,
          status: investment.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Investment creation error:", error);

    return NextResponse.json(
      {
        error: "Unable to create investment application.",
      },
      { status: 500 }
    );
  }
}