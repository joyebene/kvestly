import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { LedgerEntry } from "@/models/LedgerEntry";
import { PageTitle, EmptyState, Table, Td, Badge } from "@/components/dashboard/ui";
import { money, dateTime } from "@/lib/format";
export const metadata: Metadata = { title: "Transactions" };

export default async function Page() {
  const u = await requireUser();
  await connectDb();
  const rows = await LedgerEntry.find({ userId: u.id }).sort({ createdAt: -1 }).limit(200).lean();
  return (
    <>
      <PageTitle title="Transactions" intro="An immutable record. Entries are created only from provider-confirmed movements; corrections appear as new reversing entries." />
      {rows.length === 0 ? <EmptyState icon={ArrowLeftRight} title="No transactions yet">Confirmed deposits, withdrawals, investments and fees will be listed here.</EmptyState> : (
        <Table head={["Date", "Type", "Amount", "Status", "Reference"]}>
          {rows.map((r) => <tr key={String(r._id)}><Td>{dateTime(r.createdAt)}</Td><Td className="capitalize">{r.type}</Td><Td>{r.direction === "debit" ? "−" : "+"}{money(r.amountMinor, r.currency)}</Td><Td><Badge value={r.status} /></Td><Td className="font-mono text-xs text-silver-500">{r.providerRef ?? "—"}</Td></tr>)}
        </Table>
      )}
    </>
  );
}
