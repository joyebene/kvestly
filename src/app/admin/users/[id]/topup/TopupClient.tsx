
"use client";

import { useParams } from "next/navigation";
import { useAction } from "@/lib/useAction";
import { postJson } from "@/lib/fetch";
import {
  PageTitle,
  Field,
  Button,
  Alert,
  Loader2,
} from "@/components/dashboard/ui";

export default function TopupClient() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const a = useAction();

  return (
    <>
      <PageTitle
        title="Top-up User Wallet"
        intro={`Manually add funds to user ID: ${userId}`}
      />

      <form
        className="card max-w-xl space-y-5 p-6"
        onSubmit={(e) => {
          e.preventDefault();

          const f = Object.fromEntries(
            new FormData(e.currentTarget)
          );

          a.run(
            postJson(`/api/admin/users/${userId}/topup`, f),
            "Wallet topped up successfully."
          );
        }}
      >
        {a.error && <Alert kind="error">{a.error}</Alert>}
        {a.done && <Alert kind="success">{a.done}</Alert>}

        <Field
          label="Amount (USD)"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          error={a.fields.amount}
        />

        <Field
          label="Note (optional)"
          name="note"
          type="text"
          error={a.fields.note}
        />

        <Button type="submit" disabled={a.busy}>
          {a.busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : null}
          Top-up Wallet
        </Button>
      </form>
    </>
  );
}
