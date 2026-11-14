
import type { Metadata } from "next";
import { requireStaff } from "@/lib/session";
import TopupClient from "./TopupClient";

export const metadata: Metadata = {
  title: "Top-up User Wallet",
};

export default async function Page() {
  await requireStaff("users:manage");

  return <TopupClient />;
}
