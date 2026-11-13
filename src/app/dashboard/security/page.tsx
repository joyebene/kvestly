import type { Metadata } from "next";
import { getAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import { isStaff } from "@/lib/rbac";
import { PageTitle } from "@/components/dashboard/ui";
import { MfaPanel, PasswordForm } from "@/components/dashboard/Forms";
import { Alert } from "@/components/forms/Field";
export const metadata: Metadata = { title: "Security" };

export default async function Page({ searchParams }: { searchParams: Promise<{ mfa?: string }> }) {
  const u = await getAuth();
  if (!u) redirect("/login");
  const sp = await searchParams;
  const staff = isStaff(u.role);
  return (
    <>
      <PageTitle title="Security settings" intro="Keep your account safe." />
      <div className="space-y-6">
        {(sp.mfa === "required" || (staff && !u.mfaEnabled)) && <Alert kind="info">Staff accounts must enable two-factor authentication before using the admin console.</Alert>}
        {staff && u.mfaEnabled && !u.mfaVerified && <Alert kind="info">Sign out and sign back in with your authenticator code to unlock the admin console.</Alert>}
        <MfaPanel enabled={u.mfaEnabled} staff={staff} />
        <PasswordForm />
      </div>
    </>
  );
}
