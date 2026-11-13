import type { Metadata } from "next";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { can } from "@/lib/rbac";
import { InvestmentProduct } from "@/models/InvestmentProduct";
import { PageTitle, Table, Td, Badge } from "@/components/dashboard/ui";
import { Actions, AdminForm } from "@/components/admin/Actions";
import { Alert } from "@/components/forms/Field";
export const metadata: Metadata = { title: "Investment products" };

export default async function Page() {
  const me = await requireStaff("products:manage");
  await connectDb();
  const products = await InvestmentProduct.find().sort({ updatedAt: -1 }).limit(100).lean();
  const publish = can(me.role, "products:publish");
  return (
    <>
      <PageTitle title="Investment products" intro="A product reaches the public site only after it is complete, submitted for review, and approved by a different person with publishing rights (four-eyes). Wording such as “guaranteed” or “risk-free” is blocked." />
      <Table head={["Product", "Class", "Status", "Actions"]}>
        {products.map((p) => {
          const id = String(p._id);
          return <tr key={id}><Td><p className="font-medium text-white">{p.name}</p><p className="text-xs text-silver-500">/{p.slug}</p></Td><Td>{p.assetClass}</Td><Td><Badge value={p.status} />{p.compliance?.reference && <p className="mt-1 text-xs text-silver-500">Ref: {p.compliance.reference}</p>}</Td>
            <Td><Actions actions={[
              ...(p.status === "draft" ? [{ label: "Submit for review", url: `/api/admin/products/${id}/submit`, body: {} }] : []),
              ...(p.status === "in_review" && publish && String(p.createdBy) !== me.id ? [{ label: "Approve & publish", url: `/api/admin/products/${id}/publish`, body: {}, variant: "primary" as const, note: "required" as const }] : []),
              ...(p.status !== "archived" ? [{ label: "Archive", url: `/api/admin/products/${id}/archive`, body: {}, variant: "danger" as const }] : []),
            ]} />{p.status === "in_review" && String(p.createdBy) === me.id && <p className="mt-2 text-xs text-silver-500">Awaiting a second approver.</p>}</Td></tr>;
        })}
      </Table>
      <h2 className="mb-4 mt-12 text-xl font-semibold">New product (draft)</h2>
      <div className="mb-4"><Alert kind="info">Do not enter return figures unless they are independently verified and accompanied by a basis and risk context. The “reason” box on publish takes the compliance sign-off / regulator reference.</Alert></div>
      <div className="max-w-2xl"><AdminForm url="/api/admin/products" submit="Create draft" fields={[
        { name: "name", label: "Name", required: true }, { name: "slug", label: "URL slug", required: true, hint: "lowercase-letters-and-dashes" }, { name: "assetClass", label: "Asset class", required: true },
        { name: "summary", label: "Summary", textarea: true, required: true }, { name: "minInvestmentUsd", label: "Minimum investment (USD, whole number)", type: "number" },
        { name: "terms", label: "Terms", textarea: true }, { name: "fees", label: "Fees", textarea: true }, { name: "riskDisclosure", label: "Risk disclosure", textarea: true }, { name: "eligibility", label: "Eligibility & jurisdictions", textarea: true }, { name: "performanceDisclosure", label: "Performance disclosure (optional, never a guarantee)", textarea: true },
      ]} /></div>
    </>
  );
}