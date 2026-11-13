import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
export const metadata: Metadata = { title: "Our Vision" };
export default function Vision() {
  return (
    <>
      <PageHero eyebrow="Our vision" title={<>Redefining the Future of <span className="text-blue-gradient">Investment.</span></>} />
      <Section>
        <p className="max-w-3xl font-display text-2xl leading-snug text-silver-100 sm:text-3xl">To become a globally recognized and trusted investment company, pioneering opportunities in cryptocurrency, digital assets and financial markets while empowering individuals and businesses to build sustainable wealth and achieve lasting financial independence.</p>
        <div className="mt-10 flex gap-3"><ButtonLink href="/mission">Our mission</ButtonLink><ButtonLink href="/about" variant="secondary">About KVESTY</ButtonLink></div>
      </Section>
    </>
  );
}
