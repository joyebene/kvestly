import { handle } from "@/lib/api";
import { mfaCodeSchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { decrypt } from "@/lib/crypto";
import { checkTotp, newBackupCodes } from "@/lib/mfa";
import { audit } from "@/lib/audit";
import { Session } from "@/models/Session";
import { User } from "@/models/User";

export const POST = handle({ auth: "user", allowUnverifiedMfa: true, schema: mfaCodeSchema, limit: ["mfa-enable", 10, 900] }, async ({ user, body, req }) => {
  const u = await User.findById(user.id).select("+mfa.pendingSecretEnc");
  if (!u?.mfa?.pendingSecretEnc) throw new HttpError(400, "Start setup first.", "no_pending");
  const step = await checkTotp(decrypt(u.mfa.pendingSecretEnc), body.code.replace(/\s/g, ""));
  if (step === null) throw new HttpError(400, "That code is not valid. Check your authenticator app and try again.", "invalid_code");
  const { plain, hashes } = newBackupCodes();
  await User.updateOne({ _id: u._id }, {
    "mfa.emfaEnabled": true, "mfa.secretEnc": u.mfa.pendingSecretEnc, "mfa.backupCodeHashes": hashes, "mfa.lastStep": step,
    $unset: { "mfa.pendingSecretEnc": 1 },
  });
  await Session.updateOne({ _id: user.sessionId }, { mfaVerified: true });
  await audit({ action: "auth.mfa.enabled", actor: { id: user.id, role: user.role }, headers: req.headers });
  return { ok: true, backupCodes: plain }; // displayed once; only hashes are stored
});