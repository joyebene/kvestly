
import type { Metadata } from "next";
import { History } from "lucide-react";

import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { InvestmentPayment } from "@/models/InvestmentPayment";

import {
  PageTitle,
  EmptyState,
  Table,
  Td,
  Badge,
} from "@/components/dashboard/ui";

import { dateTime, money } from "@/lib/format";

export const metadata: Metadata = {
  title: "Investment history",
};

function formatCrypto(amount: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(amount);
}

export default async function Page() {
  const user = await requireUser();

  await connectDb();

  // Retrieve all payment attempts belonging to this user.
  const payments = await InvestmentPayment.find({
    userId: user.id,
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return (
    <>
      <PageTitle
        title="Investment history"
        intro="View your investment payment attempts, deposits and payment statuses."
      />

      {payments.length === 0 ? (
        <EmptyState
          icon={History}
          title="No investment history"
        >
          Your cryptocurrency payment history will appear here
          after you initiate an investment payment.
        </EmptyState>
      ) : (
        <Table
          head={[
            "Date",
            "Investment",
            "Cryptocurrency",
            "Expected payment",
            "Amount received",
            "USD value",
            "Status",
          ]}
        >
          {payments.map((payment) => (
            <tr key={String(payment._id)}>
              <Td>
                {dateTime(payment.createdAt)}
              </Td>

              <Td>
                <span className="font-mono text-xs">
                  {String(payment.investmentId).slice(-8).toUpperCase()}
                </span>
              </Td>

              <Td>
                <div className="font-medium">
                  {payment.cryptoCurrency}
                </div>

                <div className="text-xs text-muted-foreground">
                  {payment.cryptoNetwork}
                </div>
              </Td>

              <Td>
                <div className="font-medium">
                  {formatCrypto(payment.payAmount)}{" "}
                  {payment.cryptoCurrency}
                </div>
              </Td>

              <Td>
                <div className="font-medium">
                  {formatCrypto(payment.actuallyPaid || 0)}{" "}
                  {payment.cryptoCurrency}
                </div>
              </Td>

              <Td>
                {money(
                  Math.round(payment.priceAmount * 100),
                  payment.priceCurrency.toUpperCase()
                )}
              </Td>

              <Td>
                <Badge value={payment.paymentStatus} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
