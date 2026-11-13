import { cookies } from "next/headers";
import { handle } from "@/lib/api";
import { mfaLoginSchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, MFA_COOKIE } from "@/lib/session";
import { readMfaChallenge } from "@/lib/tokens";
import { decrypt } from "@/lib/crypto";
import { checkTotp, consumeBackupCode } from "@/lib/mfa";
import { audit } from "@/lib/audit";
import { User } from "@/models/User";
import { isStaff, type Role } from "@/lib/rbac";

export const POST = handle({ auth: "none", schema: mfaLoginSchema, limit: ["mfa", 15, 600] }, async ({ body, req }) => {
  const jar = await cookies();
  const uid = await readMfaChallenge(jar.get(MFA_COOKIE)?.value);
  if (!uid) throw new HttpError(401, "Your sign-in session expired. Please start again.", "mfa_expired");
  await rateLimit("mfa:user", uid, 6, 600);

  const user = await User.findById(uid).select("+mfa.secretEnc +mfa.backupCodeHashes +mfa.lastStep");
  if (!user || user.status !== "active" || !user.mfa?.emfaEnabled || !user.mfa.secretEnc) throw new HttpError(401, "Invalid code.", "invalid_code");

  const code = body.code.replace(/\s/g, "");
  let valid = false;
  if (/^\d{6}$/.test(code)) {
    const step = await checkTotp(decrypt(user.mfa.secretEnc), code, user.mfa.lastStep ?? 0);
    if (step !== null) { valid = true; await User.updateOne({ _id: user._id }, { "mfa.lastStep": step }); }
  } else {
    const idx = await consumeBackupCode(user.mfa.backupCodeHashes ?? [], code);
    if (idx >= 0) {
      valid = true;
      const rest = (user.mfa.backupCodeHashes ?? []).filter((_, i) => i !== idx);
      await User.updateOne({ _id: user._id }, { "mfa.backupCodeHashes": rest });
    }
  }
  if (!valid) {
    await audit({ action: "auth.mfa.failed", actor: { id: user._id, role: user.role }, outcome: "failure", headers: req.headers });
    throw new HttpError(401, "That code is not valid.", "invalid_code");
  }
  jar.delete(MFA_COOKIE);
  await createSession(user._id, user.role as Role, true);
  await audit({ action: "auth.login", actor: { id: user._id, role: user.role }, meta: { mfa: true }, headers: req.headers });
  return { ok: true, redirect: isStaff(user.role as Role) ? "/admin" : "/dashboard" };
});
