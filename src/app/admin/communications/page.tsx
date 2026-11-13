import type { Metadata } from "next";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { can } from "@/lib/rbac";
import { ContactMessage } from "@/models/ContactMessage";
import { SupportTicket } from "@/models/SupportTicket";
import { PageTitle, Badge } from "@/components/dashboard/ui";
import { Actions, AdminForm } from "@/components/admin/Actions";
import { ReplyForm } from "@/components/dashboard/Forms";
import { dateTime } from "@/lib/format";
export const metadata: Metadata = { title: "Client communication" };

export default async function Page() {
  const me = await requireStaff("support:manage");
  await connectDb();
  const [tickets, msgs] = await Promise.all([
    SupportTicket.find().sort({ updatedAt: -1 }).limit(50).lean(),
    can(me.role, "messages:read") ? ContactMessage.find().sort({ createdAt: -1 }).limit(50).lean() : Promise.resolve([]),
  ]);
  return (
    <>
      <PageTitle title="Client communication" />
      <h2 className="mb-4 text-xl font-semibold">Support tickets</h2>
      <div className="space-y-3">
        {tickets.length === 0 && <p className="text-sm text-silver-500">No tickets.</p>}
        {tickets.map((t) => (
          <details key={String(t._id)} className="card p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3"><span className="font-medium text-white">{t.subject} <span className="ml-2 font-mono text-xs text-silver-600">user …{String(t.userId).slice(-6)}</span></span><Badge value={t.status} /></summary>
            <ol className="mt-4 space-y-2">{t.messages.map((m, i) => <li key={i} className="rounded-xl bg-white/[.04] p-3"><p className="text-xs text-silver-500">{m.from} · {dateTime(m.at)}</p><p className="mt-1 whitespace-pre-line text-sm text-silver-200">{m.body}</p></li>)}</ol>
            <ReplyForm url={`/api/admin/tickets/${t._id}`} />
          </details>
        ))}
      </div>

      {msgs.length > 0 || can(me.role, "messages:read") ? (
        <>
          <h2 className="mb-4 mt-12 text-xl font-semibold">Website contact messages</h2>
          <div className="space-y-3">
            {msgs.length === 0 && <p className="text-sm text-silver-500">No messages.</p>}
            {msgs.map((m) => (
              <article key={String(m._id)} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium text-white">{m.subject}</p><p className="text-xs text-silver-500">{m.name} · {m.email}{m.phone ? ` · ${m.phone}` : ""} · {dateTime(m.createdAt)}</p></div><Badge value={m.status} /></div>
                <p className="mt-3 whitespace-pre-line text-sm text-silver-300">{m.message}</p>
                <div className="mt-4"><Actions actions={(["in_progress", "resolved", "spam"] as const).filter((s) => s !== m.status).map((s) => ({ label: `Mark ${s.replace("_", " ")}`, url: `/api/admin/contact/${m._id}`, body: { status: s } }))} /></div>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {can(me.role, "notifications:send") && (
        <>
          <h2 className="mb-4 mt-12 text-xl font-semibold">Send a notification to a client</h2>
          <div className="max-w-xl"><AdminForm url="/api/admin/notify" submit="Send notification" fields={[{ name: "userId", label: "User ID", required: true, hint: "24-character ID (see Users page / audit log)" }, { name: "title", label: "Title", required: true }, { name: "body", label: "Message", textarea: true, required: true }]} /></div>
        </>
      )}
    </>
  );
}