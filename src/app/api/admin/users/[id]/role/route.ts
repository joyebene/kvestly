import { handle } from "@/lib/api";
import { roleSchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { Session } from "@/models/Session";
import { User } from "@/models/User";

export const POST = handle({ auth: { permission: "roles:manage" }, schema: roleSchema, limit: ["admin-role", 20, 3600] }, async ({ user, body, params, req }) => {
  if (!/^[a-f0-9]{24}$/.test(params.id)) throw new HttpError(404, "Not found.", "not_found");
  if (params.id === user.id) throw new HttpError(400, "You cannot change your own role.", "self");
  const target = await User.findById(params.id);
  if (!target) throw new HttpError(404, "Not found.", "not_found");
  await audit({ action: "user.role.change", actor: { id: user.id, role: user.role }, target: { type: "user", id: params.id }, meta: { from: target.role, to: body.role }, headers: req.headers }, { critical: true });
  await User.updateOne({ _id: target._id }, { role: body.role });
  await Session.deleteMany({ userId: target._id }); // force re-login under the new role's session policy
  return { ok: true };
});
