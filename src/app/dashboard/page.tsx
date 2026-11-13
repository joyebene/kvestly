import Link from "next/link";
import { ShieldCheck, CircleDashed, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { LedgerEntry } from "@/models/LedgerEntry";
import { PageTitle, Stat, Badge, EmptyState } from "@/components/dashboard/ui";
import { features } from "@/lib/features";
import { dateTime } from "@/lib/format";

export default async function Overview() {
  const u = await requireUser();
  await connectDb();
  const [notes, entries] = await Promise.all([
    Notification.find({ userId: u.id }).sort({ createdAt: -1 }).limit(4).lean(),
    LedgerEntry.countDocuments({ userId: u.id }),
  ]);
  const steps = [
    { done: u.mfaEnabled, t: "Turn on two-factor authentication", href: "/dashboard/security", avail: true },
    { done: false, t: "Review approved investment opportunities", href: "/investment-opportunities", avail: true },
  ];
  return (
    <>
      <PageTitle title={`Welcome, ${u.fullName.split(" ")[0]}`} intro="Your account overview. Only verified data is shown here." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Two-factor auth" value={<Badge value={u.mfaEnabled ? "active" : "pending"} />} note={u.mfaEnabled ? "Enabled" : "Not enabled yet"} />
        <Link href="/dashboard/invest" className="button button-primary">Invest Now</Link>
        <Stat label="Verified portfolio" value={entries ? "See Portfolio" : "—"} note={entries ? undefined : "No verified holdings yet"} />
        <Stat label="Unread notifications" value={notes.filter((n) => !n.readAt).length} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="next" className="card p-6">
          <h2 id="next" className="text-lg font-semibold">Getting started</h2>
          <ul className="mt-5 space-y-3">
            {steps.map((s) => (
              <li key={s.t} className="flex items-center gap-3 text-sm">
                {s.done ? <CheckCircle2 className="text-emerald-300" size={18} aria-hidden /> : <CircleDashed className="text-silver-600" size={18} aria-hidden />}
                {s.avail ? <Link href={s.href} className={s.done ? "text-silver-500 line-through" : "text-white hover:text-electric-300"}>{s.t}</Link> : <span className="text-silver-600">{s.t} <span className="text-xs">(not yet available)</span></span>}
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl border border-white/[.07] bg-white/[.03] p-4 text-xs leading-relaxed text-silver-500">Investment products, deposits and withdrawals are not yet open. We will notify you here as each becomes available. Investing involves risk, including loss of capital.</p>
        </section>

        <section aria-labelledby="recent" className="card p-6">
          <div className="flex items-center justify-between"><h2 id="recent" className="text-lg font-semibold">Recent notifications</h2><Link href="/dashboard/notifications" className="text-xs text-electric-300 hover:text-white">View all</Link></div>
          {notes.length === 0 ? <p className="mt-6 text-sm text-silver-500">Nothing yet.</p> : (
            <ul className="mt-4 divide-y divide-white/[.06]">
              {notes.map((n) => <li key={String(n._id)} className="py-3"><p className="text-sm font-medium text-white">{n.title}</p><p className="mt-0.5 text-xs text-silver-500">{dateTime(n.createdAt)}</p></li>)}
            </ul>
          )}
        </section>
      </div>
      {!entries && <div className="mt-8"><EmptyState icon={ShieldCheck} title="No verified account activity yet">Balances, holdings and transactions appear here only once confirmed by our payment and custody providers. We never show estimated or simulated figures.</EmptyState></div>}
    </>
  );
}