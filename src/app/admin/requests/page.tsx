
import type { Metadata } from "next";

import { requireStaff } from "@/lib/session";
import { InvestmentFundingManager } from "@/components/admin/InvestmentFundingManager";


export const metadata: Metadata = {
  title: "Deposits & Withdrawals",
};

export default async function Page() {
  await requireStaff("investments:read");

  return <InvestmentFundingManager />;
}
