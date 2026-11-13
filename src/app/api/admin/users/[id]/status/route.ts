import { handle } from "@/lib/api";
import { statusSchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { Session } from "@/models/Session";
import { User } from "@/models/User";
import { isStaff, type Role } from "@/lib/rbac";

export const POST = handle({ auth: { permission: "users:manage" }, schema: statusSchema, limit: ["admin-user", 30, 3600] }, async ({ user, body, params, req }) => {
  if (!/^[a-f0-9]{24}$/.test(params.id)) throw new HttpError(404, "Not found.", "not_found");
  if (params.id === user.id) throw new HttpError(400, "You cannot change your own status.", "self");
  const target = await User.findById(params.id);
  if (!target) throw new HttpError(404, "Not found.", "not_found");
  if (isStaff(target.role as Role) && user.role !== "superadmin") throw new HttpError(403, "Only a super admin can change staff accounts.", "forbidden");
  await audit({ action: `user.${body.status}`, actor: { id: user.id, role: user.role }, target: { type: "user", id: params.id }, meta: { reason: body.reason, from: target.status }, headers: req.headers }, { critical: true });
  await User.updateOne({ _id: target._id }, { status: body.status });
  if (body.status === "suspended") await Session.deleteMany({ userId: target._id }); // revoke immediately
  return { ok: true };
});
