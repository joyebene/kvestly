import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { KycSubmission } from "@/models/KycSubmission";
import { User } from "@/models/User";
import { PageTitle, Table, Td, EmptyState } from "@/components/dashboard/ui";
import { Actions } from "@/components/admin/Actions";
import { dateTime } from "@/lib/format";
export const metadata: Metadata = { title: "Identity review" };

export default async function Page() {
  await requireStaff("kyc:review");
  await connectDb();
  const subs = await KycSubmission.find({ status: "pending" }).sort({ createdAt: 1 }).limit(100).lean();
  const users = await User.find({ _id: { $in: subs.map((s) => s.userId) } }).select("email").lean();
  const email = new Map(users.map((u) => [String(u._id), u.email]));
  return (
    <>
      <PageTitle title="Identity verification review" intro="You cannot review your own submission. Approvals and rejections are audited." />
      {subs.length === 0 ? <EmptyState icon={BadgeCheck} title="No pending submissions" /> : (
        <Table head={["Submitted", "Account", "Legal name", "DOB", "Country", "Document", "Decision"]}>
          {subs.map((s) => (
            <tr key={String(s._id)}><Td>{dateTime(s.createdAt)}</Td><Td>{email.get(String(s.userId))}</Td><Td>{s.legalName}</Td><Td>{s.dateOfBirth}</Td><Td>{s.country}</Td><Td className="capitalize">{s.idType.replace("_", " ")}{s.documentRefs.length === 0 && <p className="text-xs text-amber-300">No document on file</p>}</Td>
              <Td><Actions actions={[{ label: "Approve", url: `/api/admin/kyc/${s._id}`, body: { decision: "approve" }, variant: "primary", note: "optional" }, { label: "Reject", url: `/api/admin/kyc/${s._id}`, body: { decision: "reject" }, variant: "danger", note: "required" }]} /></Td></tr>
          ))}
        </Table>
      )}
    </>
  );
}