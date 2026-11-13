import type { Metadata } from "next";
import { FileText, Receipt, ShieldAlert, UserCheck, ScrollText, Landmark, Info } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { company } from "@/lib/company";
import { dbConfigured, connectDb } from "@/lib/db";
import { InvestmentProduct, type ProductDoc } from "@/models/InvestmentProduct";
import { ContentBlock } from "@/models/ContentBlock";

export const metadata: Metadata = { title: "Investment Information" };
export const revalidate = 60;

async function load() {
  if (!dbConfigured()) return { products: [] as ProductDoc[], notice: null as { title: string; body: string } | null };
  try {
    await connectDb();
    const [products, notice] = await Promise.all([
      InvestmentProduct.find({ status: "published" }).sort({ publishedAt: -1 }).lean(),
      ContentBlock.findOne({ key: "opportunities.notice", published: true }).lean(),
    ]);
    return { products: products as unknown as ProductDoc[], notice: notice ? { title: notice.title, body: notice.body } : null };
  } catch { return { products: [], notice: null }; }
}

const will = [
  { icon: ScrollText, t: "Terms", d: "How the product works, its duration, and what you agree to." },
  { icon: Receipt, t: "Fees", d: "Every fee and charge, stated up front." },
  { icon: ShieldAlert, t: "Risk disclosure", d: "The specific risks of that product, including loss of capital." },
  { icon: UserCheck, t: "Eligibility", d: "Who may invest, and where." },
  { icon: Landmark, t: "Compliance sign-off", d: "Independent review and approval before publication." },
  { icon: FileText, t: "Performance disclosure", d: "Any performance information shown with context — never as a guarantee." },
];

export default async function Page() {
  const { products, notice } = await load();
  return (
    <>
      <PageHero eyebrow="Investment information" title={<>Investment opportunities, <span className="text-blue-gradient">published only when verified.</span></>}
        intro="We will list an opportunity here only after its terms, fees, risks and eligibility requirements have been reviewed and approved. We do not advertise guaranteed returns." />
      <Section className="!py-14">
        {notice && <div className="card mb-8 border-electric/30 p-6"><h2 className="text-lg font-semibold">{notice.title}</h2><p className="mt-2 whitespace-pre-line text-sm text-silver-300">{notice.body}</p></div>}

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="card p-8">
            <p className="eyebrow mb-3">Proposed minimum</p>
            <p className="font-display text-5xl font-semibold text-white">${company.proposedMinimumInvestmentUsd.toLocaleString("en-US")}<span className="ml-2 text-base font-normal text-silver-500">proposed</span></p>
            <p className="mt-4 text-sm leading-relaxed text-silver-400">This is a proposed starting minimum and is <strong className="text-white">not final</strong>. The minimum for each product will be set out in that product&apos;s approved terms.</p>
          </div>
          <div className="card flex gap-4 border-amber-400/25 p-8">
            <Info className="mt-1 shrink-0 text-amber-300" size={20} aria-hidden />
            <p className="text-sm leading-relaxed text-silver-300"><strong className="text-white">No returns are promised.</strong> Digital asset investments carry a high risk of loss. Any return figure that is ever shown will be accompanied by its basis, its risks and a clear statement that results are not guaranteed.</p>
          </div>
        </div>

        <div className="mt-20">
          <SectionHeading title="Available opportunities" />
          {products.length === 0 ? (
            <div className="card mt-8 p-10 text-center">
              <p className="font-display text-xl text-white">No approved investment products are available yet.</p>
              <p className="mx-auto mt-3 max-w-xl text-sm text-silver-400">When an opportunity has completed review it will appear here with its full terms. Create an account to be notified in your dashboard.</p>
              <div className="mt-6 flex justify-center gap-3"><ButtonLink href="/register">Open an account</ButtonLink><ButtonLink href="/contact" variant="secondary">Ask a question</ButtonLink></div>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {products.map((p) => (
                <article key={String(p._id)} className="card p-7">
                  <p className="text-xs font-semibold uppercase tracking-[.2em] text-electric-400">{p.assetClass}</p>
                  <h3 className="mt-2 text-xl font-semibold">{p.name}</h3>
                  <p className="mt-3 text-sm text-silver-400">{p.summary}</p>
                  {p.minInvestment?.amountMinor != null && <p className="mt-4 text-sm text-silver-300">Minimum: <strong className="text-white">${(p.minInvestment.amountMinor / 100).toLocaleString("en-US")}</strong></p>}
                  <details className="mt-5 text-sm"><summary className="cursor-pointer font-medium text-electric-300">Terms, fees, risks and eligibility</summary>
                    <dl className="mt-4 space-y-4 text-silver-400">
                      {([["Terms", p.terms], ["Fees", p.fees], ["Risk disclosure", p.riskDisclosure], ["Eligibility", p.eligibility], ["Performance disclosure", p.performanceDisclosure]] as const).filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="font-semibold text-white">{k}</dt><dd className="mt-1 whitespace-pre-line">{v}</dd></div>)}
                    </dl>
                  </details>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-20">
          <SectionHeading title="What every opportunity will show" intro="Each listing is built from the same checklist so you can compare like with like." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {will.map((w) => (
              <div key={w.t} className="card p-6"><w.icon className="text-electric-300" size={22} aria-hidden /><h3 className="mt-4 text-base font-semibold">{w.t}</h3><p className="mt-1.5 text-sm text-silver-400">{w.d}</p></div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
