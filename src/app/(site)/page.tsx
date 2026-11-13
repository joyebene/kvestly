import { Target, Telescope } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Splash } from "@/components/sections/Splash";
import { ServiceCards, CommitmentsGrid, StepsList, FaqList, CtaBand } from "@/components/sections/Blocks";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { focusAreas, whyChoose } from "@/content/site";

export default function Home() {
  return (
    <>
      <Splash />
      <Hero />

      <Section className="border-t border-white/[.05]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <SectionHeading eyebrow="Who we are" title={<>Building financial opportunities <span className="text-blue-gradient">since 2019.</span></>} />
          <Reveal className="space-y-5 text-base leading-relaxed text-silver-400">
            <p>Founded in 2019, KVESTY is an investment-focused company driven by a vision to make modern investment opportunities more accessible, understandable and rewarding.</p>
            <p>With a primary focus on cryptocurrency and digital assets, alongside broader investment opportunities, we are committed to navigating the evolving financial landscape through innovation, strategic thinking and a client-focused approach.</p>
            <ButtonLink href="/about" variant="secondary" className="mt-2">Read our story</ButtonLink>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-navy-900/50 py-20 sm:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal><article className="card h-full p-8 sm:p-10">
            <Telescope className="text-electric-400" size={28} aria-hidden />
            <p className="eyebrow mb-3 mt-6">Our vision</p>
            <h3 className="text-2xl font-semibold">Redefining the Future of Investment.</h3>
            <p className="mt-4 text-sm leading-relaxed text-silver-400">To become a globally recognized and trusted investment company, pioneering opportunities in cryptocurrency, digital assets and financial markets while empowering individuals and businesses to build sustainable wealth and achieve lasting financial independence.</p>
          </article></Reveal>
          <Reveal delay={80}><article className="card h-full p-8 sm:p-10">
            <Target className="text-electric-400" size={28} aria-hidden />
            <p className="eyebrow mb-3 mt-6">Our mission</p>
            <h3 className="text-2xl font-semibold">Making Investment Opportunities Accessible to All.</h3>
            <p className="mt-4 text-sm leading-relaxed text-silver-400">Our mission is to simplify and transform the investment experience by providing innovative, transparent and strategic investment solutions across cryptocurrency and traditional financial markets.</p>
          </article></Reveal>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="What we do" title="Focused on digital assets. Open to wider markets."
          intro="At KVESTY, we focus on cryptocurrency, digital assets and diverse investment opportunities within the evolving global financial ecosystem. We combine market awareness, strategic investment thinking and a commitment to transparency to help our clients explore opportunities across different financial markets." />
        <div className="mt-14"><ServiceCards /></div>
        <p className="mx-auto mt-14 max-w-3xl text-center font-display text-xl leading-snug text-silver-200 sm:text-2xl">&ldquo;Our focus is simple: identify opportunities, understand the risks and approach investment with strategy, discipline and transparency.&rdquo;</p>
      </Section>

      <Section className="border-y border-white/[.05] bg-navy-900/40">
        <SectionHeading eyebrow="Investment focus areas" title="Where we direct our attention." align="center" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {focusAreas.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}><div className="card card-hover h-full p-6">
              <f.icon className="text-electric-300" size={26} aria-hidden />
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-silver-400">{f.text}</p>
            </div></Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHeading eyebrow="Why choose KVESTY" title="Trust is earned in the details." intro="We would rather be clear than impressive. These are the principles we hold ourselves to." />
          <div className="grid gap-5 sm:grid-cols-2">
            {whyChoose.map((w, i) => (
              <Reveal key={w.title} delay={i * 60}><div className="card h-full p-6">
                <w.icon className="text-electric-300" size={24} aria-hidden />
                <h3 className="mt-4 text-base font-semibold">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-silver-400">{w.text}</p>
              </div></Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section className="border-y border-white/[.05] bg-navy-900/40">
        <SectionHeading eyebrow="Our commitment to transparency" title={<>Transparency Is Our <span className="text-blue-gradient">Standard.</span></>}
          intro="At KVESTY, we believe trust is built through honesty, openness and accountability. Transparency is not simply a business principle; it is a commitment that guides how we communicate, operate and engage with our clients." />
        <div className="mt-14"><CommitmentsGrid /></div>
        <p className="mt-12 text-center font-display text-lg text-silver-200">Your confidence matters. Your decisions deserve clarity. Transparency is our commitment.</p>
      </Section>

      <Section>
        <SectionHeading eyebrow="How it works" title="A clear path, one step at a time." align="center"
          intro="This is the process we are building. Investing, deposits and withdrawals are not yet operational and will open only once all regulatory, custody and payment requirements are in place and verified." />
        <div className="mt-14"><StepsList /></div>
      </Section>

      <Section className="border-t border-white/[.05] bg-navy-900/40">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <SectionHeading eyebrow="FAQ" title="Straight answers." intro="Honest answers to the questions we expect you to ask." />
          <FaqList />
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
