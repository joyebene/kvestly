import { z } from "zod";
import { handle } from "@/lib/api";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { FundingRequest } from "@/models/FundingRequest";
import { Notification } from "@/models/Notification";

// NOTE: no "completed" here. Only a verified provider settlement (ledger entry) completes a request.
const schema = z.object({ status: z.enum(["under_review", "approved", "rejected"]), note: z.string().trim().max(1000).optional() });
const FLOW: Record<string, string[]> = { pending: ["under_review", "approved", "rejected"], under_review: ["approved", "rejected"] };

export const POST = handle({ auth: { permission: "requests:review" }, schema, limit: ["admin-funding", 60, 3600] }, async ({ user, body, params, req }) => {
  if (!/^[a-f0-9]{24}$/.test(params.id)) throw new HttpError(404, "Not found.", "not_found");
  const r = await FundingRequest.findById(params.id);
  if (!r) throw new HttpError(404, "Not found.", "not_found");
  if (!FLOW[r.status]?.includes(body.status)) throw new HttpError(409, `A ${r.status} request cannot move to ${body.status}.`, "bad_transition");
  if (body.status === "rejected" && !body.note) throw new HttpError(422, "Give a reason for rejection.", "validation", { note: "A reason is required." });
  await audit({ action: `funding.${body.status}`, actor: { id: user.id, role: user.role }, target: { type: "funding", id: params.id }, meta: { from: r.status, note: body.note, amountMinor: r.amountMinor }, headers: req.headers }, { critical: true });
  await FundingRequest.updateOne({ _id: r._id }, { status: body.status, reviewedBy: user.id, reviewedAt: new Date(), reviewNote: body.note });
  await Notification.create({ userId: r.userId, kind: "account", title: `Your ${r.kind} request is ${body.status.replace("_", " ")}`, body: body.note ?? "Open the Transactions page for details." });
  return { ok: true };
});
