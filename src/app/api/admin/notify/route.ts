import { handle } from "@/lib/api";
import { notifySchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";

export const POST = handle({ auth: { permission: "notifications:send" }, schema: notifySchema, limit: ["admin-notify", 60, 3600] }, async ({ user, body, req }) => {
  if (!(await User.exists({ _id: body.userId }))) throw new HttpError(404, "User not found.", "not_found");
  await Notification.create({ userId: body.userId, kind: "announcement", title: body.title, body: body.body, createdBy: user.id });
  await audit({ action: "notification.send", actor: { id: user.id, role: user.role }, target: { type: "user", id: body.userId }, headers: req.headers });
  return { ok: true };
});
