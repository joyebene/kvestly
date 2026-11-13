import { SignJWT, jwtVerify } from "jose";
import { HttpError } from "./errors";

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new HttpError(500, "Server misconfigured", "config");
  return new TextEncoder().encode(s);
};

/** Short-lived token proving the password step succeeded, pending the second factor. */
export const signMfaChallenge = (uid: string) =>
  new SignJWT({ purpose: "mfa" }).setProtectedHeader({ alg: "HS256" }).setSubject(uid).setIssuedAt().setExpirationTime("5m").sign(secret());

export async function readMfaChallenge(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.purpose === "mfa" && payload.sub ? payload.sub : null;
  } catch { return null; }
}
