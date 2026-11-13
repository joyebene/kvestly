import { handle } from "@/lib/api";
import { destroySession } from "@/lib/session";
import { audit } from "@/lib/audit";

export const POST = handle({ auth: "user", allowUnverifiedMfa: true }, async ({ user, req }) => {
  await audit({ action: "auth.logout", actor: { id: user.id, role: user.role }, headers: req.headers });
  await destroySession();
  return { ok: true };
});
