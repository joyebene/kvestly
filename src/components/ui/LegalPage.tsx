import { PageHero, Section } from "./Section";
import type { LegalDoc } from "@/content/legal";
import { AlertTriangle } from "lucide-react";

export function LegalPage({ doc, draft = true }: { doc: LegalDoc; draft?: boolean }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} intro={doc.intro} />
      <Section className="!py-14">
        <div className="mx-auto max-w-3xl">
          {draft && (
            <div className="mb-10 flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
              <p><strong>Draft for legal review.</strong> This document is a structured draft and must be reviewed and approved by qualified legal counsel before the platform launches.</p>
            </div>
          )}
          <div className="prose-kv">
            {doc.sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.p.map((t) => <p key={t}>{t}</p>)}
                {s.list && <ul>{s.list.map((l) => <li key={l}>{l}</li>)}</ul>}
              </section>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
