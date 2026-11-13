import { handle } from "@/lib/api";
import { ticketReplySchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { SupportTicket } from "@/models/SupportTicket";

export const POST = handle({ auth: "user", schema: ticketReplySchema, limit: ["ticket-reply", 20, 3600] }, async ({ user, body, params }) => {
  if (!/^[a-f0-9]{24}$/.test(params.id)) throw new HttpError(404, "Not found.", "not_found");
  // Scoped by userId: a client can only ever touch their own tickets (no IDOR).
  const r = await SupportTicket.updateOne({ _id: params.id, userId: user.id }, { status: "open", $push: { messages: { from: "client", authorId: user.id, body: body.message, at: new Date() } } });
  if (!r.matchedCount) throw new HttpError(404, "Not found.", "not_found");
  return { ok: true };
});
