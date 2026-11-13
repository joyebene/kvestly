import type { Metadata } from "next";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { LedgerEntry } from "@/models/LedgerEntry";
import { PageTitle, Table, Td, Badge, EmptyState } from "@/components/dashboard/ui";
import { money, dateTime } from "@/lib/format";
import { ArrowLeftRight } from "lucide-react";
export const metadata: Metadata = { title: "Transactions" };

export default async function Page() {
  await requireStaff("transactions:read");
  await connectDb();
  const rows = await LedgerEntry.find().sort({ createdAt: -1 }).limit(300).lean();
  return (
    <>
      <PageTitle title="Transaction monitoring" intro="Read-only. The ledger is append-only and there is deliberately no way for staff to create, edit or delete an entry here — entries come only from verified provider confirmations." />
      {rows.length === 0 ? <EmptyState icon={ArrowLeftRight} title="No ledger entries" /> : (
        <Table head={["Date", "User", "Type", "Amount", "Status", "Provider ref", "Source"]}>
          {rows.map((r) => <tr key={String(r._id)}><Td>{dateTime(r.createdAt)}</Td><Td className="font-mono text-xs">{String(r.userId).slice(-8)}</Td><Td className="capitalize">{r.type}</Td><Td>{r.direction === "debit" ? "−" : "+"}{money(r.amountMinor, r.currency)}</Td><Td><Badge value={r.status} /></Td><Td className="font-mono text-xs">{r.providerRef}</Td><Td>{r.source.replace("_", " ")}</Td></tr>)}
        </Table>
      )}
    </>
  );
}
