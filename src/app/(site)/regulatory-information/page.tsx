import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui/Section";
import { company } from "@/lib/company";
export const metadata: Metadata = { title: "Regulatory Information" };

export default function Page() {
  const rows: [string, string | null][] = [
    ["Company legal name", company.legalName],
    ["Company registration number", company.registrationNumber],
    ["Regulator", company.regulator.name],
    ["Licence / registration reference", company.regulator.licenceNumber],
    ["Public register entry", company.regulator.statusUrl],
  ];
  return (
    <>
      <PageHero eyebrow="Regulatory information" title="Where we stand, stated plainly." intro="We only publish approvals we can evidence. Any detail marked “not yet published” has not been verified and should not be assumed to exist." />
      <Section className="!py-14">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="card divide-y divide-white/[.06]">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 p-5 sm:grid-cols-[1fr_1.4fr] sm:gap-6">
                <p className="text-sm text-silver-500">{k}</p>
                <p className="text-sm text-white">{v ? (v.startsWith("http") ? <a className="text-electric-300 underline" href={v} rel="noopener noreferrer" target="_blank">{v}</a> : v) : <span className="text-silver-600">Not yet published</span>}</p>
              </div>
            ))}
          </div>
          <div className="prose-kv">
            <h2>What this means</h2>
            <p>Until registration and licensing details appear in the table above, KVESTY does not represent that it holds any regulatory approval, and it is not offering investment products, deposits or withdrawals.</p>
            <h2>Jurisdictions</h2>
            <p>Digital-asset and investment services are regulated differently in each country, and in many countries a firm must be registered or licensed before it can lawfully offer them to the public. Availability of any KVESTY service will depend on your location and will be stated here per jurisdiction once confirmed.</p>
            <h2>Check for yourself</h2>
            <p>Before dealing with any investment firm, verify its registration directly on the relevant regulator&apos;s public register. Be cautious of promises of guaranteed or unusually high returns.</p>
          </div>
        </div>
      </Section>
    </>
  );
}
