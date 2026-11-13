import { z } from "zod";
import { handle } from "@/lib/api";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { ContactMessage } from "@/models/ContactMessage";

const schema = z.object({ status: z.enum(["new", "in_progress", "resolved", "spam"]) });
export const POST = handle({ auth: { permission: "messages:read" }, schema }, async ({ user, body, params, req }) => {
  const r = await ContactMessage.updateOne({ _id: params.id }, { status: body.status, handledBy: user.id });
  if (!r.matchedCount) throw new HttpError(404, "Not found.", "not_found");
  await audit({ action: "contact.status", actor: { id: user.id, role: user.role }, target: { type: "contact", id: params.id }, meta: { status: body.status }, headers: req.headers });
  return { ok: true };
});
