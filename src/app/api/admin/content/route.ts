import { handle } from "@/lib/api";
import { contentSchema, hasProhibitedClaim } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { ContentBlock } from "@/models/ContentBlock";
import { revalidatePath } from "next/cache";

export const POST = handle({ auth: { permission: "content:manage" }, schema: contentSchema, limit: ["admin-content", 30, 3600] }, async ({ user, body, req }) => {
  if (body.published && hasProhibitedClaim(`${body.title} ${body.body}`)) throw new HttpError(422, "Contains prohibited wording (e.g. guaranteed returns).", "prohibited_claim");
  await audit({ action: "content.save", actor: { id: user.id, role: user.role }, target: { type: "content", id: body.key }, meta: { published: body.published }, headers: req.headers }, { critical: true });
  await ContentBlock.findOneAndUpdate({ key: body.key }, { ...body, updatedBy: user.id }, { upsert: true });
  revalidatePath("/investment-opportunities");
  return { ok: true };
});
