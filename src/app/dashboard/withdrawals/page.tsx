import type { Metadata } from "next";
import { FundingPage } from "../_funding";
export const metadata: Metadata = { title: "Withdrawal requests" };
export default function Page() { return <FundingPage kind="withdrawal" />; }
