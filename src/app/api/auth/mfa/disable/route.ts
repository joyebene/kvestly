import { handle } from "@/lib/api";
import { mfaCodeSchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { isStaff } from "@/lib/rbac";
import { decrypt } from "@/lib/crypto";
import { checkTotp } from "@/lib/mfa";
import { audit } from "@/lib/audit";
import { User } from "@/models/User";

export const POST = handle({ auth: "user", schema: mfaCodeSchema, limit: ["mfa-disable", 6, 900] }, async ({ user, body, req }) => {
  if (isStaff(user.role)) throw new HttpError(403, "Staff accounts must keep two-factor authentication on.", "mfa_mandatory");
  const u = await User.findById(user.id).select("+mfa.secretEnc +mfa.lastStep");
  if (!u?.mfa?.secretEnc) throw new HttpError(400, "Two-factor authentication is not on.", "no_mfa");
  if ((await checkTotp(decrypt(u.mfa.secretEnc), body.code.replace(/\s/g, ""), u.mfa.lastStep ?? 0)) === null)
    throw new HttpError(400, "That code is not valid.", "invalid_code");
  await User.updateOne({ _id: u._id }, { "mfa.enabled": false, $unset: { "mfa.secretEnc": 1 }, "mfa.backupCodeHashes": [] });
  await audit({ action: "auth.mfa.disabled", actor: { id: user.id, role: user.role }, headers: req.headers });
  return { ok: true };
});
