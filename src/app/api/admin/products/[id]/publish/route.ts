import { z } from "zod";
import { handle } from "@/lib/api";
import { HttpError } from "@/lib/errors";
import { hasProhibitedClaim } from "@/lib/validators";
import { audit } from "@/lib/audit";
import { InvestmentProduct } from "@/models/InvestmentProduct";

const schema = z.object({ reference: z.string().trim().min(3).max(120) }); // internal compliance sign-off / regulator reference

export const POST = handle({ auth: { permission: "products:publish" }, schema, limit: ["admin-publish", 20, 3600] }, async ({ user, body, params, req }) => {
  const p = await InvestmentProduct.findById(params.id);
  if (!p || p.status !== "in_review") throw new HttpError(404, "No product awaiting review.", "not_found");
  if (String(p.createdBy) === user.id) throw new HttpError(403, "Four-eyes rule: a different person must approve publication.", "four_eyes");
  if (hasProhibitedClaim([p.name, p.summary, p.terms, p.performanceDisclosure, p.riskDisclosure].join(" "))) throw new HttpError(422, "Contains prohibited wording.", "prohibited_claim");
  await audit({ action: "product.publish", actor: { id: user.id, role: user.role }, target: { type: "product", id: params.id }, meta: { reference: body.reference }, headers: req.headers }, { critical: true });
  await InvestmentProduct.updateOne({ _id: p._id }, { status: "published", publishedAt: new Date(), compliance: { approvedBy: user.id, approvedAt: new Date(), reference: body.reference } });
  return { ok: true };
});
