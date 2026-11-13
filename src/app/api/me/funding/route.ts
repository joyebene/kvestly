import { handle } from "@/lib/api";
import { fundingSchema, toMinor } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { features } from "@/lib/features";
import { audit } from "@/lib/audit";
import { FundingRequest } from "@/models/FundingRequest";

export const POST = handle({ auth: "user", schema: fundingSchema, limit: ["funding", 10, 3600] }, async ({ user, body, req }) => {
  if (!features.fundingRequests()) throw new HttpError(503, "Deposits and withdrawals are not available yet.", "feature_disabled");

  const amountMinor = toMinor(body.amount);
  if (amountMinor < 1) throw new HttpError(422, "Enter a valid amount.", "validation", { amount: "Enter a valid amount." });
  const r = await FundingRequest.create({ userId: user.id, kind: body.kind, amountMinor, userNote: body.note });
  await audit({ action: `funding.${body.kind}.request`, actor: { id: user.id, role: user.role }, target: { type: "funding", id: String(r._id) }, meta: { amountMinor }, headers: req.headers });
  return { ok: true, id: String(r._id) };
});
