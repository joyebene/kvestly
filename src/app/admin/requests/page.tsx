
import type { Metadata } from "next";
import { Inbox } from "lucide-react";

import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";

import { InvestmentApplication } from "@/models/InvestmentApplication";
import { InvestmentPayment } from "@/models/InvestmentPayment";
import { User } from "@/models/User";

import {
  PageTitle,
  Table,
  Td,
  Badge,
  EmptyState,
} from "@/components/dashboard/ui";

import { InvestmentActions } from "@/components/admin/InvestmentActions";
import { money, dateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Investment Applications",
};

export default async function Page() {
  await requireStaff("investments:read");

  await connectDb();

  // Fetch all investment applications.
  const rows = await InvestmentApplication.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  // Fetch associated users and payments.
  const [users, payments] = await Promise.all([
    User.find({
      _id: { $in: rows.map((r) => r.userId) },
    })
      .select("fullName email balance")
      .lean(),

    InvestmentPayment.find({
      investmentId: { $in: rows.map((r) => r._id) },
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

  // Keep the latest payment for each application.
  const paymentMap = new Map<
    string,
    (typeof payments)[number]
  >();

  for (const payment of payments) {
    const id = String(payment.investmentId);

    if (!paymentMap.has(id)) {
      paymentMap.set(id, payment);
    }
  }

  return (
    <>
      <PageTitle
        title="Investment Applications"
        intro="Review client investment applications, verify crypto payments and manage approvals."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No investment applications"
        >
          Client investment applications will appear here.
        </EmptyState>
      ) : (
        <Table
          head={[
            "Date",
            "Client",
            "Requested Amount",
            "Cryptocurrency",
            "Payment Status",
            "Amount Received",
            "Application Status",
            "Actions",
          ]}
        >
          {rows.map((r) => {
            const user = userMap.get(String(r.userId));
            const payment = paymentMap.get(String(r._id));

            return (
              <tr key={String(r._id)}>
                <Td>
                  {dateTime(r.createdAt)}
                </Td>

                <Td>
                  <div className="font-medium">
                    {user?.fullName ?? "Unknown user"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {user?.email ?? "—"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Balance: {money(
                      Math.round((user?.balance ?? 0) * 100),
                      "USD"
                    )}
                  </div>
                </Td>

                <Td>
                  {money(
                    Math.round(r.amountRequested * 100),
                    "USD"
                  )}

                  {r.amountApproved !== undefined && (
                    <div className="text-xs text-green-500 mt-1">
                      Approved: {money(
                        Math.round(r.amountApproved * 100),
                        "USD"
                      )}
                    </div>
                  )}
                </Td>

                <Td>
                  <div className="font-semibold">
                    {r.cryptoCurrency}
                  </div>
                  <div className="text-xs text-slate-400">
                    {r.cryptoNetwork}
                  </div>
                  {payment?.payAddress && (
                    <div
                      className="text-xs text-slate-400 mt-1 break-all"
                      title={payment.payAddress}
                    >
                      Payment address: {payment.payAddress.slice(0, 12)}...
                    </div>
                  )}
                </Td>

                <Td>
                  {payment ? (
                    <Badge value={payment.paymentStatus} />
                  ) : (
                    <Badge value="unpaid" />
                  )}

                  {payment?.transactionHash && (
                    <div className="mt-1">
                      <a
                        href={`https://www.blockchain.com/explorer/search?search=${encodeURIComponent(payment.transactionHash)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 underline"
                      >
                        View transaction
                      </a>
                    </div>
                  )}
                </Td>

                <Td>
                  {payment ? (
                    <div>
                      <div>
                        {payment.actuallyPaid}{" "}
                        {payment.cryptoCurrency}
                      </div>
                      <div className="text-xs text-slate-400">
                        Expected: {payment.payAmount}{" "}
                        {payment.cryptoCurrency}
                      </div>
                    </div>
                  ) : (
                    "—"
                  )}
                </Td>

                <Td>
                  <Badge value={r.status} />
                </Td>

                <Td>
                  <InvestmentActions
                    investmentId={String(r._id)}
                    status={r.status}
                    amountRequested={r.amountRequested}
                    paymentStatus={payment?.paymentStatus ?? "unpaid"}
                    paidUsd={
                      payment?.paymentStatus === "finished"
                        ? payment.priceAmount
                        : 0
                    }
                  />
                </Td>
              </tr>
            );
          })}
        </Table>
      )}
    </>
  );
}
