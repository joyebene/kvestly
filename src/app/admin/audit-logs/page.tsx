import type { Metadata } from "next";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { PageTitle, Table, Td, Badge } from "@/components/dashboard/ui";
import { dateTime } from "@/lib/format";
export const metadata: Metadata = { title: "Audit logs" };

export default async function Page({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  await requireStaff("audit:read");
  const { action } = await searchParams;
  await connectDb();
  const filter = action && /^[a-z._-]{1,60}$/i.test(action) ? { action: { $regex: `^${action.replace(/\./g, "\\.")}` } } : {};
  const rows = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(300).lean();
  return (
    <>
      <PageTitle title="Audit logs" intro="Append-only. Records cannot be edited or deleted through the application. Latest 300 shown." />
      <form className="mb-5 flex gap-2" role="search"><input name="action" defaultValue={action} placeholder="Filter by action prefix, e.g. kyc. or auth.login" className="input max-w-sm" aria-label="Filter by action" /><button className="rounded-xl border border-white/15 px-4 text-sm text-white hover:bg-white/5">Filter</button></form>
      <Table head={["Time", "Actor", "Action", "Target", "Outcome", "Details"]}>
        {rows.map((r) => <tr key={String(r._id)}><Td>{dateTime(r.createdAt)}</Td><Td className="font-mono text-xs">{r.actorRole ?? "—"} {r.actorId ? `…${String(r.actorId).slice(-6)}` : ""}</Td><Td className="font-mono text-xs">{r.action}</Td><Td className="font-mono text-xs">{r.targetType ? `${r.targetType}:${String(r.targetId).slice(-8)}` : "—"}</Td><Td><Badge value={r.outcome === "success" ? "approved" : r.outcome === "denied" ? "rejected" : "failed"} /></Td><Td className="max-w-xs truncate font-mono text-[11px] text-silver-500">{r.meta ? JSON.stringify(r.meta) : ""}</Td></tr>)}
      </Table>
    </>
  );
}
