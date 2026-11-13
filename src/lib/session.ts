import "server-only";
import { cookies, headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDb } from "./db";
import { randomToken, sha256, hmac } from "./crypto";
import { clientIp } from "./ip";
import { Session } from "@/models/Session";
import { User } from "@/models/User";
import { can, isStaff, sessionPolicy, type Permission, type Role } from "./rbac";

const prod = process.env.NODE_ENV === "production";
// __Host- prefix: Secure, Path=/, no Domain → can't be overwritten by a sibling subdomain.
export const SESSION_COOKIE = prod ? "__Host-kvesty_session" : "kvesty_session";
export const MFA_COOKIE = prod ? "__Host-kvesty_mfa" : "kvesty_mfa";

export interface AuthedUser {
  id: string;
  sessionId: string;
  email: string;
  fullName: string;
  role: Role;
  mfaEnabled: boolean;
  mfaVerified: boolean;
  emailVerified: boolean;
}

export const cookieOpts = (maxAgeSec: number) => ({
  httpOnly: true, secure: prod, sameSite: "lax" as const, path: "/", maxAge: maxAgeSec,
});

export async function createSession(userId: Types.ObjectId, role: Role, mfaVerified: boolean) {
  await connectDb();
  const h = await headers();
  const policy = sessionPolicy(role);
  const token = randomToken(32);
  await Session.create({
    userId,
    tokenHash: sha256(token),
    mfaVerified,
    ipHash: hmac(clientIp(h)),
    userAgent: h.get("user-agent")?.slice(0, 300),
    expiresAt: new Date(Date.now() + policy.absoluteMs),
  });
  (await cookies()).set(SESSION_COOKIE, token, cookieOpts(policy.absoluteMs / 1000));
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try { await connectDb(); await Session.deleteOne({ tokenHash: sha256(token) }); } catch { /* best effort */ }
  }
  jar.delete(SESSION_COOKIE);
}

/** Resolve the current user from the opaque session cookie. Server-side only; revocable. */
export async function getAuth(): Promise<AuthedUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !process.env.MONGODB_URI) return null;
  await connectDb();
  const s = await Session.findOne({ tokenHash: sha256(token) });
  if (!s || s.expiresAt < new Date()) return null;
  const user = await User.findById(s.userId);
  if (!user || user.status !== "active") return null;
  const policy = sessionPolicy(user.role as Role);
  if (Date.now() - s.lastUsedAt.getTime() > policy.idleMs) {
    await Session.deleteOne({ _id: s._id });
    return null;
  }
  if (Date.now() - s.lastUsedAt.getTime() > 60_000) {
    await Session.updateOne({ _id: s._id }, { lastUsedAt: new Date() });
  }
  return {
    id: String(user._id),
    sessionId: String(s._id),
    email: user.email,
    fullName: user.fullName,
    role: user.role as Role,
    mfaEnabled: user.mfa?.emfaEnabled ?? false,
    mfaVerified: s.mfaVerified,
    emailVerified: Boolean(user.emailVerifiedAt),
  };
}

/** For pages / server components. */
export async function requireUser(): Promise<AuthedUser> {
  const u = await getAuth();
  if (!u) redirect("/login");
  if (isStaff(u.role) && !(u.mfaEnabled && u.mfaVerified)) redirect("/dashboard/security?mfa=required");
  return u;
}

/** Staff pages: unauthorised users get a 404 so the admin area is not discoverable. */
export async function requireStaff(permission: Permission): Promise<AuthedUser> {
  const u = await getAuth();
  if (!u) redirect("/login");
  if (!isStaff(u.role) || !can(u.role, permission)) notFound();
  if (!(u.mfaEnabled && u.mfaVerified)) redirect("/dashboard/security?mfa=required");
  return u;
}
