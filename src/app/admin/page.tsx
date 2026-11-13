import Link from "next/link";
import { getAuth } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { can } from "@/lib/rbac";
import { User } from "@/models/User";
import { KycSubmission } from "@/models/KycSubmission";
import { FundingRequest } from "@/models/FundingRequest";
import { SupportTicket } from "@/models/SupportTicket";
import { ContactMessage } from "@/models/ContactMessage";
import { InvestmentProduct } from "@/models/InvestmentProduct";
import { PageTitle, Stat } from "@/components/dashboard/ui";

export default async function Page() {
  const u = (await getAuth())!; // layout guarantees a verified staff session
  await connectDb();
  const [users, kyc, funding, tickets, msgs, review] = await Promise.all([
    User.countDocuments(), KycSubmission.countDocuments({ status: "pending" }), FundingRequest.countDocuments({ status: { $in: ["pending", "under_review"] } }),
    SupportTicket.countDocuments({ status: "open" }), ContactMessage.countDocuments({ status: "new" }), InvestmentProduct.countDocuments({ status: "in_review" }),
  ]);
  const cards: [string, number, string, boolean][] = [
    ["Registered users", users, "/admin/users", can(u.role, "users:read")],
    ["Identity reviews pending", kyc, "/admin/verification", can(u.role, "kyc:review")],
    ["Funding requests open", funding, "/admin/requests", can(u.role, "requests:read")],
    ["Open support tickets", tickets, "/admin/communications", can(u.role, "support:manage")],
    ["New contact messages", msgs, "/admin/communications", can(u.role, "messages:read")],
    ["Products awaiting approval", review, "/admin/products", can(u.role, "products:manage")],
  ];
  return (
    <>
      <PageTitle title="Admin overview" intro="Every sensitive action on this console is permission-checked and written to an immutable audit log." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.filter((c) => c[3]).map(([l, v, h]) => <Link key={l} href={h}><Stat label={l} value={v} /></Link>)}
      </div>
    </>
  );
}
