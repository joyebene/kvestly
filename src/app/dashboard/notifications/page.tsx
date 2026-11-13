import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { PageTitle, EmptyState } from "@/components/dashboard/ui";
import { MarkAllRead } from "@/components/dashboard/Forms";
import { dateTime } from "@/lib/format";
export const metadata: Metadata = { title: "Notifications" };

export default async function Page() {
  const u = await requireUser();
  await connectDb();
  const rows = await Notification.find({ userId: u.id }).sort({ createdAt: -1 }).limit(100).lean();
  return (
    <>
      <PageTitle title="Notifications" action={rows.some((r) => !r.readAt) ? <MarkAllRead /> : undefined} />
      {rows.length === 0 ? <EmptyState icon={Bell} title="No notifications" /> : (
        <ul className="space-y-3">
          {rows.map((n) => (
            <li key={String(n._id)} className="card p-5">
              <div className="flex items-start justify-between gap-4"><h2 className="text-base font-semibold">{n.title}{!n.readAt && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-electric align-middle" aria-label="Unread" />}</h2><time className="shrink-0 text-xs text-silver-500">{dateTime(n.createdAt)}</time></div>
              <p className="mt-2 whitespace-pre-line text-sm text-silver-400">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
