
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";

import { PageTitle, Badge } from "@/components/dashboard/ui";
import { dateOnly } from "@/lib/format";
import { WalletUpdateForm } from "@/components/WalletUpdateForm";

export const metadata: Metadata = {
  title: "Account profile",
};

export default async function Page() {
  const u = await requireUser();

  await connectDb();

  const doc = await User.findById(u.id)
    .select("country createdAt virtualWalletAddress")
    .lean();

  const rows: [string, ReactNode][] = [
    ["Full name", u.fullName],
    ["Email", u.email],
    ["Country", doc?.country ?? "Not provided"],
    [
      "Email verified",
      <Badge
        key="email-verified"
        value={u.emailVerified ? "approved" : "pending"}
      />,
    ],
    [
      "Member since",
      doc?.createdAt ? dateOnly(doc.createdAt) : "—",
    ],
    [
      "Role",
      <span key="role" className="capitalize">
        {u.role}
      </span>,
    ],
    [
      "Virtual Wallet Address",
      doc?.virtualWalletAddress ?? "Not provided",
    ],
  ];

  return (
    <>
      <PageTitle
        title="Account profile"
        intro="To change your name or email, contact support so we can verify the request."
      />

      <dl className="card max-w-2xl divide-y divide-white/[.06]">
        {rows.map(([key, value]) => (
          <div
            key={key}
            className="grid gap-1 p-5 sm:grid-cols-[180px_1fr]"
          >
            <dt className="text-sm text-silver-500">{key}</dt>
            <dd className="text-sm text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <WalletUpdateForm
        userId={u.id}
        initialWalletAddress={doc?.virtualWalletAddress ?? ""}
      />
    </>
  );
}
