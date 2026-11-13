import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/AuthForms";
import { features } from "@/lib/features";
import { Alert } from "@/components/forms/Field";
export const metadata: Metadata = { title: "Open an account", robots: { index: false } };
export default function Page() {
  return (
    <>
      <h1 className="mt-10 text-3xl font-semibold">Open an account</h1>
      <p className="mb-6 mt-2 text-sm text-silver-500">Creating an account does not commit you to invest. Investment products, deposits and withdrawals are not yet available.</p>
      {features.registration() ? <RegisterForm /> : <Alert kind="info">Registration is not open yet. Please check back soon or contact us.</Alert>}
    </>
  );
}
