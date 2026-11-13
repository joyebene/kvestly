import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { SupportTicket } from "@/models/SupportTicket";
import { PageTitle, Badge } from "@/components/dashboard/ui";
import { TicketForm, ReplyForm } from "@/components/dashboard/Forms";
import { dateTime } from "@/lib/format";
export const metadata: Metadata = { title: "Support" };

export default async function Page() {
  const u = await requireUser();
  await connectDb();
  const tickets = await SupportTicket.find({ userId: u.id }).sort({ updatedAt: -1 }).limit(50).lean();
  return (
    <>
      <PageTitle title="Support" intro="Never share your password, seed phrase or private keys with anyone, including KVESTY staff." />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <TicketForm />
        <div className="space-y-4">
          {tickets.length === 0 && <p className="text-sm text-silver-500">No support requests yet.</p>}
          {tickets.map((t) => (
            <details key={String(t._id)} className="card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3"><span className="font-medium text-white">{t.subject}</span><Badge value={t.status} /></summary>
              <ol className="mt-4 space-y-3">
                {t.messages.map((m, i) => <li key={i} className={m.from === "staff" ? "rounded-xl bg-electric/10 p-3" : "rounded-xl bg-white/[.04] p-3"}><p className="text-xs text-silver-500">{m.from === "staff" ? "KVESTY team" : "You"} · {dateTime(m.at)}</p><p className="mt-1 whitespace-pre-line text-sm text-silver-200">{m.body}</p></li>)}
              </ol>
              <ReplyForm url={`/api/me/support/${t._id}`} />
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
