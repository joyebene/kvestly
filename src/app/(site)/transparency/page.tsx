import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui/Section";
import { CommitmentsGrid, CtaBand } from "@/components/sections/Blocks";
export const metadata: Metadata = { title: "Transparency and Trust" };
export default function Transparency() {
  return (
    <>
      <PageHero eyebrow="Transparency and trust" title={<>Transparency Is Our <span className="text-blue-gradient">Standard.</span></>}
        intro="At KVESTY, we believe trust is built through honesty, openness and accountability. Transparency is not simply a business principle; it is a commitment that guides how we communicate, operate and engage with our clients." />
      <Section>
        <p className="mb-12 max-w-3xl text-lg leading-relaxed text-silver-400">We understand that investment involves important financial decisions. That is why we believe every client deserves clear information, honest communication and a proper understanding of the opportunities and risks associated with their investments.</p>
        <CommitmentsGrid />
        <p className="mt-14 text-center font-display text-xl text-silver-100">Your confidence matters. Your decisions deserve clarity. Transparency is our commitment.</p>
      </Section>
      <CtaBand />
    </>
  );
}
