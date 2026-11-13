import type { Metadata } from "next";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { ContentBlock } from "@/models/ContentBlock";
import { PageTitle, Table, Td, Badge } from "@/components/dashboard/ui";
import { AdminForm } from "@/components/admin/Actions";
import { dateTime } from "@/lib/format";
export const metadata: Metadata = { title: "Content" };

export default async function Page() {
  await requireStaff("content:manage");
  await connectDb();
  const blocks = await ContentBlock.find().sort({ updatedAt: -1 }).lean();
  return (
    <>
      <PageTitle title="Content" intro={<>Managed text blocks. Currently the key <code className="text-silver-200">opportunities.notice</code> is shown on the Investment Information page when published. Saving is audited and blocks prohibited claims.</>} />
      <Table head={["Key", "Title", "Published", "Updated"]}>
        {blocks.map((b) => <tr key={String(b._id)}><Td className="font-mono text-xs">{b.key}</Td><Td>{b.title}</Td><Td><Badge value={b.published ? "published" : "draft"} /></Td><Td>{dateTime(b.updatedAt)}</Td></tr>)}
      </Table>
      <h2 className="mb-4 mt-12 text-xl font-semibold">Create or update a block</h2>
      <div className="max-w-xl"><AdminForm url="/api/admin/content" submit="Save" resetOnOk={false}
        fields={[{ name: "key", label: "Key", required: true, hint: "e.g. opportunities.notice" }, { name: "title", label: "Title", required: true }, { name: "body", label: "Body", textarea: true, required: true }, { name: "published", label: "Published (type “yes” to publish)", hint: "Leave blank to keep as draft" }]} /></div>
    </>
  );
}