import type { Metadata } from "next";
import { History } from "lucide-react";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { LedgerEntry } from "@/models/LedgerEntry";
import { PageTitle, EmptyState, Table, Td, Badge } from "@/components/dashboard/ui";
import { money, dateTime } from "@/lib/format";
export const metadata: Metadata = { title: "Investment history" };

export default async function Page() {
  const u = await requireUser();
  await connectDb();
  const rows = await LedgerEntry.find({ userId: u.id, type: { $in: ["investment", "distribution"] } }).sort({ createdAt: -1 }).limit(100).lean();
  return (
    <>
      <PageTitle title="Investment history" />
      {rows.length === 0 ? <EmptyState icon={History} title="No investment history">Confirmed investments and distributions will be listed here.</EmptyState> : (
        <Table head={["Date", "Type", "Amount", "Status"]}>
          {rows.map((r) => <tr key={String(r._id)}><Td>{dateTime(r.createdAt)}</Td><Td className="capitalize">{r.type}</Td><Td>{r.direction === "debit" ? "−" : "+"}{money(r.amountMinor, r.currency)}</Td><Td><Badge value={r.status} /></Td></tr>)}
        </Table>
      )}
    </>
  );
}
