import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
export const metadata: Metadata = { title: "Our Mission" };
export default function Mission() {
  return (
    <>
      <PageHero eyebrow="Our mission" title={<>Making Investment Opportunities <span className="text-blue-gradient">Accessible to All.</span></>} />
      <Section>
        <div className="max-w-3xl space-y-6 text-lg leading-relaxed text-silver-300">
          <p>Our mission is to simplify and transform the investment experience by providing innovative, transparent and strategic investment solutions across cryptocurrency and traditional financial markets.</p>
          <p>We are committed to empowering our clients with the knowledge, opportunities and professional support they need to make informed financial decisions, navigate evolving markets and pursue long-term financial growth.</p>
        </div>
        <div className="mt-10 flex gap-3"><ButtonLink href="/vision">Our vision</ButtonLink><ButtonLink href="/services" variant="secondary">What we do</ButtonLink></div>
      </Section>
    </>
  );
}
