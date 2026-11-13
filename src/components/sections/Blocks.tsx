import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { services, commitments, steps, faqs } from "@/content/site";
import { ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export function ServiceCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
      {services.map((s, i) => (
        <Reveal key={s.title} delay={i * 60} className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"}>
          <article className="card card-hover h-full p-7">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-sheen/20 text-electric-300 ring-1 ring-electric/30"><s.icon size={22} aria-hidden /></span>
            <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-silver-400">{s.text}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function CommitmentsGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
      {commitments.map((c, i) => (
        <Reveal key={c.title} delay={i * 60} className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"}>
          <article className="card h-full p-7">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-electric/40 text-electric-300"><c.icon size={20} aria-hidden /></span>
              <h3 className="text-lg font-semibold">{c.title}</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-silver-400">{c.text}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function StepsList() {
  return (
    <ol className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((s, i) => (
        <Reveal key={s.title} delay={i * 60}>
          <li className="card h-full list-none p-7">
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-sheen/20 text-electric-300 ring-1 ring-electric/30"><s.icon size={22} aria-hidden /></span>
              <span className="font-display text-5xl font-semibold text-white/[.07]" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-5 text-lg font-semibold"><span className="sr-only">Step {i + 1}: </span>{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-silver-400">{s.text}</p>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

export function FaqList() {
  return (
    <div className="divide-y divide-white/[.08] rounded-2xl border border-white/[.08] bg-white/[.02]">
      {faqs.map((f) => (
        <details key={f.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-white">
            {f.q}
            <ChevronDown size={18} className="shrink-0 text-electric-400 transition group-open:rotate-180" aria-hidden />
          </summary>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-silver-400">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-3xl border border-electric/25 bg-gradient-to-br from-royal-900/70 via-navy-900 to-navy-950 p-10 sm:p-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-electric/25 blur-3xl" aria-hidden />
          <div className="relative max-w-2xl">
            <SectionHeading title="Have a question? Let's talk." intro="Ask us about KVESTY, our approach and how we are preparing to open investment opportunities. Our team will respond to your enquiry." />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact">Request a consultation</ButtonLink>
              <ButtonLink href="/how-it-works" variant="secondary">See how it works</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
