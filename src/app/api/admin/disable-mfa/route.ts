import { handle } from "@/lib/api";
import { HttpError } from "@/lib/errors";
import { User } from "@/models/User";
import { connectDb } from "@/lib/db";
import { z } from "zod";
import { requireStaff } from "@/lib/session"; // Import requireStaff for authorization

// Define a schema for validating the incoming request body
const disableMfaSchema = z.object({
  userId: z.string().min(1, "User ID cannot be empty."),
});

export const POST = handle({ auth: "user", schema: disableMfaSchema }, async ({ user: staffUser, body }) => {
  // Ensure only an authorized staff member (e.g., an existing admin) can use this
  await requireStaff("users:manage"); // Or a more specific permission if you have one

  await connectDb();

  const { userId } = body;

  // Find the user and update their mfa.emfaEnabled field
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { "mfa.emfaEnabled": false }, // Set emfaEnabled to false
    { new: true } // Return the updated document
  );

  if (!updatedUser) {
    throw new HttpError(404, "User not found.", "user_not_found");
  }

  return { message: `2FA disabled for user ${updatedUser.email} (${updatedUser.fullName}).` };
});