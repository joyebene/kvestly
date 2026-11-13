import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <main id="main" className="flex flex-col justify-center px-5 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Logo height={44} />
          {children}
          <p className="mt-10 flex items-center gap-2 text-xs text-silver-600"><ShieldCheck size={14} aria-hidden /> Protected by Cloudflare Turnstile. We will never ask for your private keys or seed phrase.</p>
        </div>
      </main>
      <aside className="relative hidden overflow-hidden border-l border-white/[.06] bg-navy-900 lg:block" aria-hidden>
        <div className="absolute inset-0 bg-navy-radial" />
        <div className="absolute inset-0 grid place-items-center p-16">
          <div className="max-w-md">
            <p className="eyebrow mb-4">Your Trusted Investment Partner</p>
            <p className="font-display text-4xl font-semibold leading-tight text-white">Transparency is our <span className="text-blue-gradient">standard.</span></p>
            <p className="mt-5 text-silver-400">Your confidence matters. Your decisions deserve clarity.</p>
            <Link href="/" tabIndex={-1} className="mt-8 inline-block text-sm text-electric-300">← Back to kvesty</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
