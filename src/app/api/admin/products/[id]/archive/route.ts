import { handle } from "@/lib/api";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { InvestmentProduct } from "@/models/InvestmentProduct";

export const POST = handle({ auth: { permission: "products:manage" } }, async ({ user, params, req }) => {
  const r = await InvestmentProduct.updateOne({ _id: params.id, status: { $ne: "archived" } }, { status: "archived" });
  if (!r.matchedCount) throw new HttpError(404, "Not found.", "not_found");
  await audit({ action: "product.archive", actor: { id: user.id, role: user.role }, target: { type: "product", id: params.id }, headers: req.headers }, { critical: true });
  return { ok: true };
});
