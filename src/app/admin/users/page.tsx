import type { Metadata } from "next";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { can } from "@/lib/rbac";
import { User } from "@/models/User";
import { PageTitle, Table, Td, Badge } from "@/components/dashboard/ui";
import { Actions } from "@/components/admin/Actions";
import { dateOnly } from "@/lib/format";
export const metadata: Metadata = { title: "Users" };

export default async function Page() {
  const me = await requireStaff("users:read");
  await connectDb();
  const users = await User.find().sort({ createdAt: -1 }).limit(200).lean();
  const manage = can(me.role, "users:manage");
  const roles = can(me.role, "roles:manage");
  return (
    <>
      <PageTitle title="Users" intro="Suspending a user revokes all of their sessions immediately. Reasons are recorded in the audit log." />
      <Table head={["User", "Role", "Status", "KYC", "MFA", "Joined", ...(manage ? ["Actions"] : [])]}>
        {users.map((u) => {
          const id = String(u._id); const self = id === me.id;
          return (
            <tr key={id}>
              <Td><p className="font-medium text-white">{u.fullName}</p><p className="text-xs text-silver-500">{u.email}</p></Td>
              <Td className="capitalize">{u.role}</Td><Td><Badge value={u.status} /></Td><Td><Badge value={u.kycStatus} /></Td><Td>{u.mfa?.enabled ? "On" : "Off"}</Td><Td>{dateOnly(u.createdAt)}</Td>
              {manage && <Td>{self ? <span className="text-xs text-silver-600">You</span> : (
                <Actions actions={[
                  u.status === "active"
                    ? { label: "Suspend", url: `/api/admin/users/${id}/status`, body: { status: "suspended" }, variant: "danger", note: "required" }
                    : { label: "Reactivate", url: `/api/admin/users/${id}/status`, body: { status: "active" }, note: "required" },
                  ...(roles ? (["client", "support", "compliance", "finance", "admin"] as const).filter((r) => r !== u.role).map((r) => ({ label: `→ ${r}`, url: `/api/admin/users/${id}/role`, body: { role: r } })) : []),
                ]} />
              )}</Td>}
            </tr>
          );
        })}
      </Table>
    </>
  );
}