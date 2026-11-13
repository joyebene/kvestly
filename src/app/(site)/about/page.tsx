import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { CtaBand } from "@/components/sections/Blocks";
export const metadata: Metadata = { title: "About KVESTY", description: "Founded in 2019, KVESTY is an investment-focused company built on transparency, integrity, innovation and responsible investment practices." };

const paras = [
  "Founded in 2019, KVESTY is an investment-focused company driven by a vision to make modern investment opportunities more accessible, understandable and rewarding.",
  "With a primary focus on cryptocurrency and digital assets, alongside broader investment opportunities, we are committed to navigating the evolving financial landscape through innovation, strategic thinking and a client-focused approach.",
  "We recognize that the world of finance is constantly changing, creating new opportunities for individuals and businesses to participate in the global investment market.",
  "At KVESTY, we embrace this evolution by focusing on emerging financial technologies, digital asset markets and diverse investment opportunities.",
  "Our approach is built around transparency, integrity, continuous innovation and responsible investment practices.",
  "We believe that informed decisions, proper market understanding and a commitment to accountability are essential to building confidence in the investment journey.",
  "Since our establishment, our ambition has remained clear: to contribute to a more accessible, informed and forward-thinking investment environment.",
];
export default function About() {
  return (
    <>
      <PageHero eyebrow="About KVESTY" title={<>Building Financial Opportunities <span className="text-blue-gradient">Since 2019.</span></>} />
      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6 text-lg leading-relaxed text-silver-300">
            {paras.map((p) => <p key={p}>{p}</p>)}
            <p className="font-display text-2xl leading-snug text-white">At KVESTY, we don&apos;t just look at where finance is today; we focus on the opportunities shaping its future.</p>
          </div>
          <aside className="space-y-4 self-start">
            {[["Founded", "2019"], ["Primary focus", "Cryptocurrency & digital assets"], ["Principles", "Transparency · Integrity · Innovation · Responsibility"]].map(([k, v]) => (
              <div key={k} className="card p-6"><p className="text-xs font-semibold uppercase tracking-[.2em] text-electric-400">{k}</p><p className="mt-2 text-lg text-white">{v}</p></div>
            ))}
            <div className="flex flex-wrap gap-3 pt-2"><ButtonLink href="/vision" variant="secondary">Our vision</ButtonLink><ButtonLink href="/mission" variant="secondary">Our mission</ButtonLink></div>
          </aside>
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
