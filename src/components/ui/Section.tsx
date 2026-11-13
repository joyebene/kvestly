import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return <section id={id} className={cn("py-20 sm:py-28", className)}><div className="container-x">{children}</div></section>;
}

export function SectionHeading({ eyebrow, title, intro, align = "left", className }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; align?: "left" | "center"; className?: string }) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className={cn("eyebrow mb-4", align === "center" && "justify-center")}>{eyebrow}</p>}
      <h2 className="text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">{title}</h2>
      {intro && <div className="mt-5 text-base leading-relaxed text-silver-400 sm:text-lg">{intro}</div>}
    </div>
  );
}

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <header className="relative overflow-hidden border-b border-white/[.06] pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-navy-radial" aria-hidden />
      <div className="container-x relative">
        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-silver-400">{intro}</p>}
      </div>
    </header>
  );
}
