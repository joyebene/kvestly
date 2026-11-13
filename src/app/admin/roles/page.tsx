import type { Metadata } from "next";
import { Check } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { ROLES, PERMISSIONS, can } from "@/lib/rbac";
import { PageTitle } from "@/components/dashboard/ui";
export const metadata: Metadata = { title: "Roles & permissions" };

export default async function Page() {
  await requireStaff("users:read");
  return (
    <>
      <PageTitle title="Roles & permissions" intro="Permissions are defined in code (src/lib/rbac.ts) and reviewed via pull request, not editable in the UI. Role changes are made on the Users page by a super admin and are audited." />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="border-b border-white/[.07] text-left text-xs uppercase tracking-[.12em] text-silver-500"><th className="px-5 py-3.5">Permission</th>{ROLES.filter((r) => r !== "client").map((r) => <th key={r} className="px-3 py-3.5 text-center capitalize">{r}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/[.05]">
            {PERMISSIONS.map((p) => <tr key={p}><td className="px-5 py-3 font-mono text-xs text-silver-300">{p}</td>{ROLES.filter((r) => r !== "client").map((r) => <td key={r} className="px-3 py-3 text-center">{can(r, p) ? <Check size={16} className="mx-auto text-emerald-300" aria-label="Allowed" /> : <span className="text-silver-700" aria-label="Not allowed">—</span>}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-xs text-silver-500">Four-eyes rule: a product cannot be published by the person who created it. Staff sessions require MFA, expire after 8 hours and after 30 minutes idle.</p>
    </>
  );
}
