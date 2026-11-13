import { z } from "zod";
import { handle } from "@/lib/api";
import { passwordSchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { hashPassword, verifyPassword } from "@/lib/password";
import { audit } from "@/lib/audit";
import { Session } from "@/models/Session";
import { User } from "@/models/User";

const schema = z.object({ current: z.string().min(1).max(128), next: passwordSchema });

export const POST = handle({ auth: "user", schema, limit: ["pw-change", 5, 3600] }, async ({ user, body, req }) => {
  const u = await User.findById(user.id).select("+passwordHash");
  if (!u || !(await verifyPassword(body.current, u.passwordHash))) throw new HttpError(400, "Your current password is incorrect.", "invalid_credentials", { current: "Incorrect password." });
  if (body.current === body.next) throw new HttpError(422, "Choose a new password.", "validation", { next: "Must differ from the current password." });
  await User.updateOne({ _id: u._id }, { passwordHash: await hashPassword(body.next) });
  await Session.deleteMany({ userId: u._id, _id: { $ne: user.sessionId } }); // sign out everywhere else
  await audit({ action: "auth.password.change", actor: { id: user.id, role: user.role }, headers: req.headers });
  return { ok: true };
});
