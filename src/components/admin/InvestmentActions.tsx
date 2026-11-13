
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { postJson } from "@/lib/client-api";

interface Props {
  investmentId: string;
  status: string;
  amountRequested: number;
  paymentStatus: string;
  paidUsd: number;
}

export function InvestmentActions({
  investmentId,
  status,
  amountRequested,
  paymentStatus,
  paidUsd,
}: Props) {
  const router = useRouter();

  const [approvedAmount, setApprovedAmount] = useState(
    String(amountRequested)
  );
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const processed = status !== "pending";
  const canApprove =
    paymentStatus === "finished" && paidUsd > 0;

  async function submitDecision(decision: "approved" | "rejected") {
    setBusy(true);
    setError("");
    setSuccess("");

    const amount = Number(approvedAmount);

    if (decision === "approved" && (!Number.isFinite(amount) || amount <= 0)) {
      setError("Enter a valid approved amount.");
      setBusy(false);
      return;
    }

    if (decision === "approved" && amount > paidUsd + 0.01) {
      setError("Approved amount cannot exceed the verified payment amount.");
      setBusy(false);
      return;
    }

    if (decision === "rejected" && note.trim().length < 3) {
      setError("Please provide a rejection reason.");
      setBusy(false);
      return;
    }

    const response = await postJson(
      `/api/admin/investments/${investmentId}`,
      {
        status: decision,
        amountApproved: decision === "approved" ? amount : undefined,
        note: note.trim(),
      }
    );

    setBusy(false);

    if (!response.ok) {
      setError(response.error.message);
      return;
    }

    setSuccess(
      decision === "approved"
        ? "Investment approved and balance credited."
        : "Investment rejected."
    );

    router.refresh();
  }

  if (processed) {
    return (
      <span className="text-xs text-slate-400 capitalize">
        {status}
      </span>
    );
  }

  return (
    <div className="min-w-[190px] space-y-2">
      <label className="block text-xs text-slate-400">
        Approved amount (USD)
      </label>

      <input
        type="number"
        min="0.01"
        max={paidUsd || undefined}
        step="0.01"
        value={approvedAmount}
        onChange={(event) => setApprovedAmount(event.target.value)}
        disabled={busy || !canApprove}
        className="input w-full"
      />

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Admin note / rejection reason"
        maxLength={1000}
        className="input min-h-[65px] w-full"
        disabled={busy}
      />

      {!canApprove && (
        <p className="text-xs text-amber-400">
          Approval is unavailable until payment is finished.
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {success && (
        <p className="text-xs text-green-400">{success}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={busy || !canApprove}
          onClick={() => submitDecision("approved")}
          className="!px-3 !py-1.5 text-xs"
        >
          {busy ? "Processing..." : "Approve"}
        </Button>

        <Button
          variant="danger"
          disabled={busy}
          onClick={() => submitDecision("rejected")}
          className="!px-3 !py-1.5 text-xs"
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
