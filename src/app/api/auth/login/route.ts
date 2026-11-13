import { cookies } from "next/headers";
import { handle } from "@/lib/api";
import { loginSchema } from "@/lib/validators";
import { HttpError } from "@/lib/errors";
import { verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, MFA_COOKIE, cookieOpts } from "@/lib/session";
import { signMfaChallenge } from "@/lib/tokens";
import { audit } from "@/lib/audit";
import { User } from "@/models/User";
import { isStaff, type Role } from "@/lib/rbac";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;
const GENERIC = "Invalid email or password, or the account is temporarily locked.";

export const POST = handle(
  { auth: "none", schema: loginSchema, turnstile: true, limit: ["login", 15, 900] },
  async ({ body, req }) => {
    await rateLimit("login:email", body.email, 8, 900);
    const user = await User.findOne({ email: body.email }).select("+passwordHash");
    const locked = user?.lockedUntil && user.lockedUntil > new Date();
    // Always run a bcrypt compare (dummy hash if no user) so timing doesn't reveal account existence.
    const ok = await verifyPassword(body.password, user?.passwordHash);

    if (!user || !ok || locked || user.status !== "active") {
      if (user && !locked) {
        const fails = (user.failedLogins ?? 0) + 1;
        await User.updateOne({ _id: user._id }, fails >= MAX_FAILS ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MS) } : { failedLogins: fails });
      }
      await audit({ action: "auth.login.failed", actor: user ? { id: user._id, role: user.role } : null, outcome: "failure", meta: { locked: Boolean(locked) }, headers: req.headers });
      throw new HttpError(401, GENERIC, "invalid_credentials");
    }

    await User.updateOne({ _id: user._id }, { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() });

    if (user.mfa?.emfaEnabled) {
      (await cookies()).set(MFA_COOKIE, await signMfaChallenge(String(user._id)), cookieOpts(300));
      return { mfaRequired: true };
    }
    await createSession(user._id, user.role as Role, false);
    await audit({ action: "auth.login", actor: { id: user._id, role: user.role }, headers: req.headers });
    // Staff must enrol MFA before reaching anything sensitive.
    return { ok: true, redirect: isStaff(user.role as Role) ? "/dashboard/security?mfa=required" : "/dashboard" };
  },
);
