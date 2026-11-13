import type { Metadata } from "next";
import { Mail, MapPin, Phone, Share2 } from "lucide-react";
import { PageHero, Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/forms/ContactForm";
import { company } from "@/lib/company";
export const metadata: Metadata = { title: "Contact Us" };

const pending = <span className="text-silver-600">To be published once verified</span>;
const socials = [["X", company.social.x], ["LinkedIn", company.social.linkedin], ["Instagram", company.social.instagram], ["Telegram", company.social.telegram]] as const;

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact us" title={<>Let&apos;s start a <span className="text-blue-gradient">conversation.</span></>} intro="Send us a message and our team will reply by email. For your security, never include passwords, seed phrases or private keys." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <ContactForm />
          <aside className="space-y-5 self-start">
            <div className="card divide-y divide-white/[.06] p-2">
              <Row icon={Mail} label="Email">{company.email ? <a className="text-white hover:text-electric-300" href={`mailto:${company.email}`}>{company.email}</a> : pending}</Row>
              <Row icon={Phone} label="Phone">{company.phone ? <a className="text-white hover:text-electric-300" href={`tel:${company.phone}`}>{company.phone}</a> : pending}</Row>
              <Row icon={MapPin} label="Office">{company.address ? <span className="text-white">{company.address}</span> : pending}</Row>
              <Row icon={Share2} label="Social">
                {socials.some(([, u]) => u) ? <span className="flex flex-wrap gap-x-4 gap-y-1">{socials.filter(([, u]) => u).map(([n, u]) => <a key={n} href={u!} rel="noopener noreferrer" target="_blank" className="text-white hover:text-electric-300">{n}</a>)}</span> : pending}
              </Row>
            </div>
            <div className="card grid h-48 place-items-center text-center text-sm text-silver-600">
              {company.address ? <p className="px-6">Map will appear here once a verified location is configured.</p> : <p className="px-6">Map placeholder — shown when a verified company address is published.</p>}
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
function Row({ icon: I, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 p-5">
      <I size={18} className="mt-0.5 text-electric-400" aria-hidden />
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-silver-500">{label}</p><p className="mt-1 text-sm">{children}</p></div>
    </div>
  );
}
