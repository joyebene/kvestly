import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { GlobeVisual } from "./GlobeVisual";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-36 sm:pb-28 sm:pt-44">
      <div className="pointer-events-none absolute inset-0 bg-navy-radial" aria-hidden />
      <div className="pointer-events-none absolute inset-0 opacity-[.35] [background-image:linear-gradient(rgba(139,184,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(139,184,255,.07)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_70%_30%,#000,transparent_70%)]" aria-hidden />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <div className="animate-fade-up">
          <p className="eyebrow mb-6">Invest. Trade. Grow.</p>
          <h1 className="text-[2.6rem] font-semibold leading-[1.03] sm:text-6xl lg:text-[4.25rem]">
            Redefining the <span className="text-silver-gradient">Future</span> of <span className="text-blue-gradient">Investment.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-silver-400 sm:text-lg">
            Discover a forward-thinking investment experience focused on cryptocurrency, digital assets and evolving financial markets. At KVESTY, we are committed to making investment opportunities more accessible through strategic thinking, innovation and transparency.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/investment-opportunities">Explore Investment Opportunities <ArrowRight size={16} /></ButtonLink>
            <ButtonLink href="/about" variant="secondary">Learn About KVESTY</ButtonLink>
          </div>
          <p className="mt-8 max-w-md text-xs leading-relaxed text-silver-600">
            Investing in digital assets carries a high risk of loss. No returns are guaranteed.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-[560px] animate-fade-up [animation-delay:.15s]">
          <GlobeVisual className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}
