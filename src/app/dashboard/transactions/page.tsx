
import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";

import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { Transaction } from "@/models/Transaction";

import {
  PageTitle,
  EmptyState,
  Table,
  Td,
  Badge,
} from "@/components/dashboard/ui";

import { money, dateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Transactions",
};

export default async function Page() {
  const u = await requireUser();

  await connectDb();

  const rows = await Transaction.find({
    userId: u.id,
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return (
    <>
      <PageTitle
        title="Transactions"
        intro="View your deposits, withdrawals, investments, profits and account top-ups."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions yet"
        >
          Your account transactions will appear here.
        </EmptyState>
      ) : (
        <Table
          head={[
            "Date",
            "Type",
            "Description",
            "Amount",
            "Balance after",
            "Status",
          ]}
        >
          {rows.map((r) => (
            <tr key={String(r._id)}>
              <Td>
                {dateTime(r.createdAt)}
              </Td>

              <Td>
                <span className="capitalize">
                  {r.type.replace("_", " ")}
                </span>
              </Td>

              <Td>
                {r.description || "—"}
              </Td>

              <Td>
                <span
                  className={
                    r.type === "withdrawal"
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {r.type === "withdrawal" ? "−" : "+"}
                  {money(
                    Math.round(r.amountUSD * 100),
                    "USD"
                  )}
                </span>
              </Td>

              <Td>
                {money(
                  Math.round(r.balanceAfterUSD * 100),
                  "USD"
                )}
              </Td>

              <Td>
                <Badge value={r.status} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
