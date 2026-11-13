import { handle } from "@/lib/api";
import { Notification } from "@/models/Notification";

export const POST = handle({ auth: "user" }, async ({ user }) => {
  await Notification.updateMany({ userId: user.id, readAt: { $exists: false } }, { readAt: new Date() });
  return { ok: true };
});
