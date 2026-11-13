import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui/Section";
import { ServiceCards, CtaBand } from "@/components/sections/Blocks";
export const metadata: Metadata = { title: "What We Do", description: "Cryptocurrency, Bitcoin and digital assets, wider digital-asset market opportunities, general investment opportunities, and investment guidance and market insights." };
export default function Services() {
  return (
    <>
      <PageHero eyebrow="What we do" title={<>Cryptocurrency, digital assets and <span className="text-blue-gradient">diverse opportunities.</span></>}
        intro="At KVESTY, we focus on cryptocurrency, digital assets and diverse investment opportunities within the evolving global financial ecosystem. We combine market awareness, strategic investment thinking and a commitment to transparency to help our clients explore opportunities across different financial markets." />
      <Section>
        <ServiceCards />
        <p className="mx-auto mt-14 max-w-3xl text-center font-display text-xl leading-snug text-silver-200 sm:text-2xl">&ldquo;Our focus is simple: identify opportunities, understand the risks and approach investment with strategy, discipline and transparency.&rdquo;</p>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-silver-600">Descriptions above describe our areas of focus. They are not offers of specific investment products; any product will be published separately with its own terms, fees, risks and eligibility once approved.</p>
      </Section>
      <CtaBand />
    </>
  );
}
