import { handle } from "@/lib/api";
import { registerSchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { features } from "@/lib/features";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { audit } from "@/lib/audit";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

const DOC_VERSION = "2026-11-draft"; // bump when legal documents change; re-consent flow keys off this

export const POST = handle(
  { auth: "none", schema: registerSchema, turnstile: true, limit: ["register", 6, 3600] },
  async ({ body, req }) => {
    if (!features.registration()) throw new HttpError(403, "Registration is not open yet.", "registration_closed");
    const now = new Date();
    let user;
    try {
      user = await User.create({
        email: body.email,
        passwordHash: await hashPassword(body.password),
        fullName: body.fullName,
        country: body.country,
        consent: { termsAcceptedAt: now, privacyAcceptedAt: now, riskAcknowledgedAt: now, documentVersion: DOC_VERSION },
      });
    } catch (e: unknown) {
      if ((e as { code?: number }).code === 11000)
        throw new HttpError(409, "We couldn't create that account. If you already have one, please sign in.", "exists");
      throw e;
    }
    await Notification.create({
      userId: user._id, kind: "account", title: "Welcome to KVESTY",
      body: "Your account has been created. Investment products, identity verification and funding are not yet available; we will notify you here when they are.",
    });
    await audit({ action: "auth.register", actor: { id: user._id, role: "client" }, target: { type: "user", id: String(user._id) }, headers: req.headers });
    await createSession(user._id, "client", false);
    return { ok: true, redirect: "/dashboard" };
  },
);
