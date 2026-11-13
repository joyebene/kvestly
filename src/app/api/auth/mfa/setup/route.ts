import { handle } from "@/lib/api";
import { HttpError } from "@/lib/errors";
import { encrypt } from "@/lib/crypto";
import { newTotpSecret, totpSetupPayload } from "@/lib/mfa";
import { User } from "@/models/User";

export const POST = handle({ auth: "user", allowUnverifiedMfa: true, limit: ["mfa-setup", 10, 3600] }, async ({ user }) => {
  if (user.mfaEnabled) throw new HttpError(409, "Two-factor authentication is already on.", "mfa_already");
  const secret = newTotpSecret();
  await User.updateOne({ _id: user.id }, { "mfa.pendingSecretEnc": encrypt(secret) });
  const { qr, uri } = await totpSetupPayload(user.email, secret);
  return { qr, secret, uri }; // shown once to the signed-in user, never logged
});
