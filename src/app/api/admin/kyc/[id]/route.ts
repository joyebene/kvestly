import { handle } from "@/lib/api";
import { reviewSchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { KycSubmission } from "@/models/KycSubmission";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";

export const POST = handle({ auth: { permission: "kyc:review" }, schema: reviewSchema, limit: ["admin-kyc", 60, 3600] }, async ({ user, body, params, req }) => {
  if (!/^[a-f0-9]{24}$/.test(params.id)) throw new HttpError(404, "Not found.", "not_found");
  const sub = await KycSubmission.findById(params.id);
  if (!sub || sub.status !== "pending") throw new HttpError(404, "No pending submission found.", "not_found");
  if (String(sub.userId) === user.id) throw new HttpError(403, "You cannot review your own verification.", "self");
  if (body.decision === "reject" && !body.note) throw new HttpError(422, "Give a reason for rejection.", "validation", { note: "A reason is required." });
  const status = body.decision === "approve" ? "approved" : "rejected";
  await audit({ action: `kyc.${body.decision}`, actor: { id: user.id, role: user.role }, target: { type: "kyc", id: params.id }, meta: { subject: String(sub.userId), note: body.note }, headers: req.headers }, { critical: true });
  await KycSubmission.updateOne({ _id: sub._id }, { status, reviewedBy: user.id, reviewedAt: new Date(), reviewNote: body.note });
  await User.updateOne({ _id: sub.userId }, { kycStatus: status });
  await Notification.create({ userId: sub.userId, kind: "kyc", title: status === "approved" ? "Identity verified" : "Identity verification unsuccessful", body: status === "approved" ? "Your identity verification has been approved." : `Your identity verification was not approved. ${body.note ?? ""}`.trim() });
  return { ok: true };
});
