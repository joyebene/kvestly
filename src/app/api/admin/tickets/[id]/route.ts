import { handle } from "@/lib/api";
import { ticketReplySchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { SupportTicket } from "@/models/SupportTicket";
import { Notification } from "@/models/Notification";

export const POST = handle({ auth: { permission: "support:manage" }, schema: ticketReplySchema, limit: ["admin-ticket", 120, 3600] }, async ({ user, body, params, req }) => {
  const t = await SupportTicket.findByIdAndUpdate(params.id, { status: "awaiting_client", $push: { messages: { from: "staff", authorId: user.id, body: body.message, at: new Date() } } });
  if (!t) throw new HttpError(404, "Not found.", "not_found");
  await Notification.create({ userId: t.userId, kind: "account", title: `Reply to: ${t.subject}`.slice(0, 160), body: "Our team has replied to your support request. Open Support to read it." });
  await audit({ action: "ticket.reply", actor: { id: user.id, role: user.role }, target: { type: "ticket", id: params.id }, headers: req.headers });
  return { ok: true };
});
