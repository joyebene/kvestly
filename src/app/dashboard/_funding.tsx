import { Wallet } from "lucide-react";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { FundingRequest } from "@/models/FundingRequest";
import { features } from "@/lib/features";
import { PageTitle, EmptyState, Table, Td, Badge } from "@/components/dashboard/ui";
import { FundingForm } from "@/components/dashboard/Forms";
import { Alert } from "@/components/forms/Field";
import { money, dateTime } from "@/lib/format";

export async function FundingPage({ kind }: { kind: "deposit" | "withdrawal" }) {
  const u = await requireUser();
  await connectDb();
  const rows = await FundingRequest.find({ userId: u.id, kind }).sort({ createdAt: -1 }).limit(100).lean();
  const enabled = features.fundingRequests();
  const ready = enabled;
  return (
    <>
      <PageTitle title={`${kind === "deposit" ? "Deposit" : "Withdrawal"} requests`} />
      {!enabled ? (
        <EmptyState icon={Wallet} title={`${kind === "deposit" ? "Deposits" : "Withdrawals"} are not available yet`}>
          They will open only after our payment and custody arrangements and regulatory requirements are in place and verified. We will notify you here.
        </EmptyState>
      ) : <FundingForm kind={kind} />}
      {rows.length > 0 && (
        <div className="mt-8"><Table head={["Date", "Amount", "Status", "Note"]}>
          {rows.map((r) => <tr key={String(r._id)}><Td>{dateTime(r.createdAt)}</Td><Td>{money(r.amountMinor, r.currency)}</Td><Td><Badge value={r.status} /></Td><Td>{r.reviewNote ?? "—"}</Td></tr>)}
        </Table></div>
      )}
    </>
  );
}