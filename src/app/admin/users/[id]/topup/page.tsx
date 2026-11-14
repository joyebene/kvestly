import type { Metadata } from "next";
import { requireStaff } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { PageTitle, Field, Button, Alert, Loader2 } from "@/components/dashboard/ui";
import { notFound } from "next/navigation";
import { useAction } from "@/lib/useAction";
import { postJson } from "@/lib/fetch";


export const metadata: Metadata = { title: "Top-up User Wallet" };

export default async function Page({ params }: { params: { id: string } }) {
   const me = await requireStaff("users:manage");
  await connectDb();

  console.log("--- Debugging Topup Page ---");
  console.log("params.id received:", params.id);

  const user = await User.findById(params.id).lean();

  console.log("Result of User.findById:", user);

  if (!user) {
    console.log(`User with ID ${params.id} not found. Calling notFound().`);
    notFound();
  }

  return (
    <>
      <PageTitle title={`Top-up ${user.fullName}'s Wallet`} intro="Manually add funds to this user's virtual wallet." />

      <TopupForm userId={params.id} />
    </>
  );
}

function TopupForm({ userId }: { userId: string }) {
  const a = useAction();

  return (
    <form
      className="card max-w-xl space-y-5 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.currentTarget));
        a.run(postJson(`/api/admin/users/${userId}/topup`, f), "Wallet topped up successfully.");
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
        {a.busy ? <Loader2 size={16} className="animate-spin" /> : null} Top-up Wallet
      </Button>
    </form>
  );
}
