import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { can } from "@/lib/rbac";
import { FundingRequest } from "@/models/FundingRequest";
import { User } from "@/models/User";
import { PageTitle, Table, Td, Badge, EmptyState } from "@/components/dashboard/ui";
import { Actions } from "@/components/admin/Actions";
import { Alert } from "@/components/forms/Field";
import { money, dateTime } from "@/lib/format";
export const metadata: Metadata = { title: "Deposit & withdrawal requests" };

export default async function Page() {
  const me = await requireStaff("requests:read");
  await connectDb();
  const rows = await FundingRequest.find().sort({ createdAt: -1 }).limit(200).lean();
  const users = await User.find({ _id: { $in: rows.map((r) => r.userId) } }).select("email").lean();
  const email = new Map(users.map((u) => [String(u._id), u.email]));
  const review = can(me.role, "requests:review");
  return (
    <>
      <PageTitle title="Deposit & withdrawal requests" />
      <div className="mb-6"><Alert kind="info">Approving a request records a decision only. It does <strong>not</strong> move money and cannot mark a request completed; settlement happens through a verified payment/custody provider and is recorded in the ledger.</Alert></div>
      {rows.length === 0 ? <EmptyState icon={Inbox} title="No requests" /> : (
        <Table head={["Date", "User", "Kind", "Amount", "Status", ...(review ? ["Actions"] : [])]}>
          {rows.map((r) => {
            const open = r.status === "pending" || r.status === "under_review";
            return <tr key={String(r._id)}><Td>{dateTime(r.createdAt)}</Td><Td>{email.get(String(r.userId))}</Td><Td className="capitalize">{r.kind}</Td><Td>{money(r.amountMinor, r.currency)}</Td><Td><Badge value={r.status} /></Td>
              {review && <Td>{open && <Actions actions={[
                ...(r.status === "pending" ? [{ label: "Start review", url: `/api/admin/funding/${r._id}`, body: { status: "under_review" } }] : []),
                { label: "Approve", url: `/api/admin/funding/${r._id}`, body: { status: "approved" }, variant: "primary" as const, note: "optional" as const },
                { label: "Reject", url: `/api/admin/funding/${r._id}`, body: { status: "rejected" }, variant: "danger" as const, note: "required" as const },
              ]} />}</Td>}
            </tr>;
          })}
        </Table>
      )}
    </>
  );
}