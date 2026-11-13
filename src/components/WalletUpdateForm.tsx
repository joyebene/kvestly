
"use client";

import { useState } from "react";
import { useAction } from "@/lib/useAction";
import { postJson } from "@/lib/fetch";
import { Field, Button, Alert } from "@/components/dashboard/ui";

interface WalletUpdateFormProps {
  userId: string;
  initialWalletAddress: string;
}

export function WalletUpdateForm({
  initialWalletAddress,
}: WalletUpdateFormProps) {
  const [walletAddress, setWalletAddress] = useState(initialWalletAddress);

  const { run, busy, error, done } = useAction();

  async function handleUpdate() {
    const address = walletAddress.trim();

    if (!address) return;

    await run(
      postJson("/me/wallet", {
        walletAddress: address,
      }),
      "Wallet address updated successfully."
    );
  }

  return (
    <div className="card mt-6 max-w-2xl p-5">
      <h3 className="mb-4 text-lg font-semibold">
        Update Virtual Wallet Address
      </h3>

      <Field label="New Wallet Address">
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="input"
          placeholder="Enter new wallet address"
          disabled={busy}
        />
      </Field>

      {error && (
        <div className="mt-3">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      {done && (
        <div className="mt-3">
          <Alert kind="success">{done}</Alert>
        </div>
      )}

      <Button
        onClick={handleUpdate}
        disabled={busy || !walletAddress.trim()}
        className="mt-4"
      >
        {busy ? "Updating..." : "Update Wallet Address"}
      </Button>
    </div>
  );
}
