
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";

async function main() {
  const {
    MONGODB_URI,
    MONGODB_DB,
    SEED_ADMIN_EMAIL: email,
    SEED_ADMIN_PASSWORD: password,
  } = process.env;

  if (!MONGODB_URI || !email || !password) {
    throw new Error("Missing required environment variables.");
  }

  if (password.length < 14) {
    throw new Error("Password must be at least 14 characters.");
  }

  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB ?? "kvesty",
  });

  const user = await User.findOne({
    email: email.toLowerCase(),
    role: "superadmin",
  });

  if (!user) {
    throw new Error("Super Admin account not found.");
  }

  user.passwordHash = await bcrypt.hash(password, 12);

  await user.save();

  console.log(`Password successfully reset for ${user.email}.`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
