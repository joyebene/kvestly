import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { PageTitle } from "@/components/dashboard/ui";
import InvestmentForm from "@/components/invest/InvestmentForm";


export const metadata: Metadata = {
  title: "Invest",
};

export default async function Page() {
  await requireUser();

  return (
    <>
      <PageTitle
        title="Invest"
        intro="Submit your investment application."
      />

      <InvestmentForm />
    </>
  );
}