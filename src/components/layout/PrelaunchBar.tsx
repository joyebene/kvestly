import Link from "next/link";
import { Info } from "lucide-react";

/** Honest status banner. Remove (set NEXT_PUBLIC_PLATFORM_STAGE=live) only once licensing, custody and payments are verified. */
export function PrelaunchBar() {
  if (process.env.NEXT_PUBLIC_PLATFORM_STAGE === "live") return null;
  return (
    <div className="relative z-[60] border-b border-electric/20 bg-royal-900/60 text-center text-xs text-silver-200 sm:text-[13px]">
      <p className="container-x flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2">
        <Info size={14} className="text-electric-400" aria-hidden />
        <span>Pre-launch: investment products, deposits and withdrawals are not yet open.</span>
        <Link href="/regulatory-information" className="font-semibold text-white underline decoration-electric/60 underline-offset-2 hover:decoration-white">Regulatory status</Link>
      </p>
    </div>
  );
}
