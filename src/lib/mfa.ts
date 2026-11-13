import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

export const newTotpSecret = () => generateSecret();

export async function totpSetupPayload(email: string, secret: string) {
  const uri = generateURI({ issuer: "KVESTY", label: email, secret });
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220 });
  return { uri, qr };
}

/** Returns the accepted time-step, or null. `afterTimeStep` blocks replay of an already-used code. */
export async function checkTotp(secret: string, token: string, lastStep = 0): Promise<number | null> {
  if (!/^\d{6}$/.test(token)) return null;
  const r = await verify({ secret, token, epochTolerance: 30, afterTimeStep: lastStep });
  return r.valid ? (r as { timeStep?: number }).timeStep ?? Math.floor(Date.now() / 30000) : null;
}

export function newBackupCodes(n = 8) {
  const plain = Array.from({ length: n }, () => randomBytes(5).toString("hex")); // 10 hex chars
  return { plain, hashes: plain.map((c) => bcrypt.hashSync(c, 10)) };
}
export async function consumeBackupCode(hashes: string[], code: string) {
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(code.toLowerCase().trim(), hashes[i])) return i;
  }
  return -1;
}
