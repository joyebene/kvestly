import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { KycSubmission } from "@/models/KycSubmission";
import { features } from "@/lib/features";
import { PageTitle, Badge, EmptyState } from "@/components/dashboard/ui";
import { KycForm } from "@/components/dashboard/Forms";
import { Alert } from "@/components/forms/Field";
export const metadata: Metadata = { title: "Verification" };

export default async function Page() {
  const u = await requireUser();
  await connectDb();
  const last = await KycSubmission.findOne({ userId: u.id }).sort({ createdAt: -1 }).lean();
  return (
    <>
      <PageTitle title="Account verification" intro="Where required by law, we verify clients' identity before offering investment services." action={<Badge value={u.kycStatus} />} />
      {!features.kyc() ? (
        <EmptyState icon={BadgeCheck} title="Identity verification is not open yet">We will notify you here as soon as verification becomes available. You do not need to send any documents now.</EmptyState>
      ) : u.kycStatus === "not_started" || u.kycStatus === "rejected" ? (
        <div className="space-y-5">{u.kycStatus === "rejected" && <Alert kind="error">Your last submission was not approved{last?.reviewNote ? `: ${last.reviewNote}` : "."} You may submit again.</Alert>}<KycForm /></div>
      ) : (
        <Alert kind={u.kycStatus === "approved" ? "success" : "info"}>{u.kycStatus === "approved" ? "Your identity has been verified." : "Your submission is awaiting review. We will notify you when there is an update."}</Alert>
      )}
    </>
  );
}
