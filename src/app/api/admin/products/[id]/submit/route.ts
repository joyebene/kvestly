import { handle } from "@/lib/api";
import { HttpError } from "@/lib/errors";
import { hasProhibitedClaim } from "@/lib/validators";
import { audit } from "@/lib/audit";
import { InvestmentProduct } from "@/models/InvestmentProduct";

export const POST = handle({ auth: { permission: "products:manage" } }, async ({ user, params, req }) => {
  const p = await InvestmentProduct.findById(params.id);
  if (!p || p.status !== "draft") throw new HttpError(404, "No draft found.", "not_found");
  const missing = (["terms", "fees", "riskDisclosure", "eligibility"] as const).filter((k) => !p[k]?.trim());
  if (missing.length) throw new HttpError(422, `Complete these before review: ${missing.join(", ")}.`, "incomplete");
  if (hasProhibitedClaim([p.name, p.summary, p.terms, p.performanceDisclosure].join(" "))) throw new HttpError(422, "Contains prohibited wording.", "prohibited_claim");
  await audit({ action: "product.submit", actor: { id: user.id, role: user.role }, target: { type: "product", id: params.id }, headers: req.headers }, { critical: true });
  await InvestmentProduct.updateOne({ _id: p._id }, { status: "in_review" });
  return { ok: true };
});
