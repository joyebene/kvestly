import { handle } from "@/lib/api";
import { productSchema, hasProhibitedClaim } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { InvestmentProduct } from "@/models/InvestmentProduct";

export const POST = handle({ auth: { permission: "products:manage" }, schema: productSchema, limit: ["admin-product", 30, 3600] }, async ({ user, body, req }) => {
  const { minInvestmentUsd, ...rest } = body;
  const text = [rest.name, rest.summary, rest.terms, rest.performanceDisclosure].join(" ");
  if (hasProhibitedClaim(text)) throw new HttpError(422, "Contains prohibited wording (e.g. guaranteed / risk-free returns).", "prohibited_claim");
  try {
    const p = await InvestmentProduct.create({ ...rest, minInvestment: minInvestmentUsd != null ? { amountMinor: minInvestmentUsd * 100, currency: "USD" } : undefined, createdBy: user.id });
    await audit({ action: "product.create", actor: { id: user.id, role: user.role }, target: { type: "product", id: String(p._id) }, headers: req.headers });
    return { ok: true, id: String(p._id) };
  } catch (e) {
    if ((e as { code?: number }).code === 11000) throw new HttpError(409, "That slug is already used.", "exists", { slug: "Already used." });
    throw e;
  }
});
