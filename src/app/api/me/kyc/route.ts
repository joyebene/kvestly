import { handle } from "@/lib/api";
import { kycSchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { features } from "@/lib/features";
import { audit } from "@/lib/audit";
import { KycSubmission } from "@/models/KycSubmission";
import { User } from "@/models/User";

export const POST = handle({ auth: "user", schema: kycSchema, limit: ["kyc", 5, 86400] }, async ({ user, body, req }) => {
  if (!features.kyc()) throw new HttpError(503, "Identity verification is not available yet.", "feature_disabled");
  if (user.kycStatus === "pending" || user.kycStatus === "approved") throw new HttpError(409, "Verification is already in progress or complete.", "kyc_exists");
  const sub = await KycSubmission.create({ userId: user.id, ...body });
  await User.updateOne({ _id: user.id }, { kycStatus: "pending" });
  await audit({ action: "kyc.submit", actor: { id: user.id, role: user.role }, target: { type: "kyc", id: String(sub._id) }, headers: req.headers });
  return { ok: true };
});
