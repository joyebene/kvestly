import { handle } from "@/lib/api";
import { ticketSchema } from "@/lib/validators";
import { SupportTicket } from "@/models/SupportTicket";

export const POST = handle({ auth: "user", schema: ticketSchema, limit: ["ticket", 5, 3600] }, async ({ user, body }) => {
  const t = await SupportTicket.create({ userId: user.id, subject: body.subject, messages: [{ from: "client", authorId: user.id, body: body.message }] });
  return { ok: true, id: String(t._id) };
});
