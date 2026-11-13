import type { Metadata } from "next";
import { PieChart } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ledgerSummary } from "@/lib/queries";
import { PageTitle, EmptyState, Table, Td } from "@/components/dashboard/ui";
import { money } from "@/lib/format";
export const metadata: Metadata = { title: "Portfolio" };

export default async function Page() {
  const u = await requireUser();
  const rows = await ledgerSummary(u.id);
  const inv = rows.filter((r) => r._id.type === "investment" || r._id.type === "distribution");
  return (
    <>
      <PageTitle title="Investment portfolio" intro="Holdings confirmed by our custody and investment providers. Nothing here is estimated." />
      {inv.length === 0 ? (
        <EmptyState icon={PieChart} title="No verified holdings yet">When you invest in an approved product and the investment is confirmed, it will appear here.</EmptyState>
      ) : (
        <Table head={["Type", "Direction", "Entries", "Total (settled)"]}>
          {inv.map((r) => <tr key={`${r._id.type}${r._id.direction}${r._id.currency}`}><Td className="capitalize">{r._id.type}</Td><Td className="capitalize">{r._id.direction}</Td><Td>{r.n}</Td><Td>{money(r.total, r._id.currency)}</Td></tr>)}
        </Table>
      )}
    </>
  );
}
