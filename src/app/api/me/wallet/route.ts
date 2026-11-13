import { handle } from "@/lib/api";
import { HttpError } from "@/lib/errors";
import { User } from "@/models/User";
import { connectDb } from "@/lib/db";
import { z } from "zod";

// Define a schema for validating the incoming request body
const walletUpdateSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address cannot be empty.").max(255, "Wallet address is too long."), // Adjust max length as needed
});

export const POST = handle({ auth: "user", schema: walletUpdateSchema }, async ({ user, body }) => {
  await connectDb();

  const { walletAddress } = body;

  // Find the user and update their virtual wallet address
  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    { virtualWalletAddress: walletAddress },
    { new: true } // Return the updated document
  );

  if (!updatedUser) {
    throw new HttpError(404, "User not found.", "user_not_found");
  }

  return { message: "Wallet address updated successfully." };
});