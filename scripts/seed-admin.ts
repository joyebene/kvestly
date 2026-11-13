/**
 * Creates the first super admin. Run once, locally or in a trusted shell:
 *   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='long unique passphrase' \
 *   npx tsx --env-file=.env.local scripts/seed-admin.ts
 * The account must enrol two-factor authentication on first sign-in before the admin console unlocks.
 * Change/remove SEED_ADMIN_PASSWORD from your shell history afterwards.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";
import { AuditLog } from "../src/models/AuditLog";

async function main() {
  const { MONGODB_URI, MONGODB_DB, SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: password } = process.env;
  if (!MONGODB_URI || !email || !password) throw new Error("Set MONGODB_URI, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.");
  if (password.length < 14) throw new Error("Use a password of at least 14 characters.");
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB ?? "kvesty" });
  await User.syncIndexes();
  if (await User.exists({ role: "superadmin" })) throw new Error("A super admin already exists. Refusing to create another.");
  const u = await User.create({ email: email.toLowerCase(), fullName: "Super Admin", role: "superadmin", passwordHash: await bcrypt.hash(password, 12), emailVerifiedAt: new Date() });
  await AuditLog.create({ action: "admin.seed", actorRole: "system", targetType: "user", targetId: String(u._id) });
  console.log(`Created super admin ${u.email}. Sign in and enable two-factor authentication.`);
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e.message); process.exit(1); });
