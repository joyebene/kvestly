import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { features } from "@/lib/features";
import { Logo } from "@/components/layout/Logo";
import { Stat, Table, Td, Badge } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Demonstration environment", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * DEMO ONLY. Static placeholder values to show what the dashboard will look like once real,
 * provider-verified data exists. Nothing here is read from or written to the database, and none
 * of it represents a real account, product, return or transaction.
 */
const SAMPLE = {
  positions: [["Sample Product A", "Sample asset class", "$0.00"], ["Sample Product B", "Sample asset class", "$0.00"]],
  tx: [["01 Jan 2000", "Sample deposit", "+$0.00", "settled"], ["02 Jan 2000", "Sample investment", "−$0.00", "pending"]],
};

export default function Demo() {
  if (!features.demo()) notFound();
  return (
    <div className="relative min-h-dvh">
      <div className="sticky top-0 z-50 border-b border-amber-400/40 bg-amber-400 px-4 py-2.5 text-center text-sm font-semibold text-navy-950">
        <FlaskConical size={16} className="mr-2 inline align-[-3px]" aria-hidden />DEMONSTRATION ENVIRONMENT — SAMPLE DATA ONLY. Not a real account. No real balances, returns or transactions.
      </div>
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex items-center justify-between"><Logo height={40} /><Link href="/" className="text-sm text-electric-300">Exit demo</Link></div>
        <h1 className="mt-10 text-3xl font-semibold">Dashboard preview</h1>
        <p className="mt-2 text-sm text-silver-500">Layout preview using placeholder values (all zero). The live dashboard shows only provider-verified data.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Sample balance" value="$0.00" note="SAMPLE" /><Stat label="Sample holdings" value="2" note="SAMPLE" /><Stat label="Verification" value={<Badge value="approved" />} note="SAMPLE" />
        </div>
        <h2 className="mb-3 mt-10 text-lg font-semibold">Sample portfolio</h2>
        <Table head={["Product", "Class", "Value"]}>{SAMPLE.positions.map((r) => <tr key={r[0]}>{r.map((c) => <Td key={c}>{c}</Td>)}</tr>)}</Table>
        <h2 className="mb-3 mt-10 text-lg font-semibold">Sample transactions</h2>
        <Table head={["Date", "Type", "Amount", "Status"]}>{SAMPLE.tx.map((r) => <tr key={r[0]}><Td>{r[0]}</Td><Td>{r[1]}</Td><Td>{r[2]}</Td><Td><Badge value={r[3]} /></Td></tr>)}</Table>
      </div>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-40 grid place-items-center overflow-hidden"><span className="-rotate-12 select-none text-[12vw] font-black uppercase tracking-widest text-amber-300/[.06]">Demo</span></div>
    </div>
  );
}
