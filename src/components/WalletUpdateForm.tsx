
"use client";

import { useState } from "react";
import { useAction } from "@/lib/useAction";
import { postJson } from "@/lib/fetch";
import { Button, Alert } from "@/components/dashboard/ui";

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
            postJson("/api/me/wallet", {
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

            <div className="space-y-2">
                <label
                    htmlFor="walletAddress"
                    className="block text-sm font-medium text-silver-300"
                >
                    New Wallet Address
                </label>

                <input
                    id="walletAddress"
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="input w-full"
                    placeholder="Enter new wallet address"
                    disabled={busy}
                />
            </div>

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
