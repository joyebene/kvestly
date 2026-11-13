import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHero, Section } from "@/components/ui/Section";
import { StepsList, FaqList, CtaBand } from "@/components/sections/Blocks";
export const metadata: Metadata = { title: "How It Works" };
export default function HowItWorks() {
  return (
    <>
      <PageHero eyebrow="How it works" title={<>A clear path, <span className="text-blue-gradient">one step at a time.</span></>} intro="The process we are building for clients, from creating an account to monitoring an investment." />
      <Section>
        <div className="card mb-12 flex gap-4 border-electric/25 p-6">
          <Info className="mt-0.5 shrink-0 text-electric-400" size={20} aria-hidden />
          <p className="text-sm leading-relaxed text-silver-300"><strong className="text-white">Current status.</strong> Account creation is available. Identity verification, investment products, deposits, trades and withdrawals are <strong className="text-white">not yet operational</strong>; each will open only after the required backend, custody arrangements, payment integrations and regulatory requirements have been implemented and verified.</p>
        </div>
        <StepsList />
      </Section>
      <Section className="border-t border-white/[.05] bg-navy-900/40"><FaqList /></Section>
      <CtaBand />
    </>
  );
}
