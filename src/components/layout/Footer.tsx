import Link from "next/link";
import { Logo } from "./Logo";
import { company } from "@/lib/company";

const nav = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Our Services" },
  { href: "/investment-opportunities", label: "Investment Information" },
  { href: "/contact", label: "Contact Us" },
];
const company_ = [
  { href: "/vision", label: "Our Vision" },
  { href: "/mission", label: "Our Mission" },
  { href: "/transparency", label: "Transparency" },
  { href: "/how-it-works", label: "How It Works" },
];
const legal = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/risk-disclosure", label: "Risk Disclosure" },
  { href: "/regulatory-information", label: "Regulatory Information" },
];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-white/[.07] bg-navy-950">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo variant="full" height={96} />
          <p className="mt-5 text-sm font-semibold tracking-[.2em] text-silver-200">INVEST. TRADE. GROW.</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-silver-500">
            KVESTY is an investment-focused company founded in {company.founded}, concentrating on cryptocurrency, digital assets and broader investment opportunities, with transparency at the centre of how we communicate.
          </p>
        </div>
        <FooterCol title="Explore" links={nav} />
        <FooterCol title="Company" links={company_} />
        <FooterCol title="Legal" links={legal} />
      </div>
      <div className="border-t border-white/[.06]">
        <div className="container-x space-y-4 py-8 text-xs leading-relaxed text-silver-500">
          <p>
            <strong className="text-silver-300">Risk warning.</strong> Cryptocurrencies and other digital assets are volatile and high-risk. The value of an investment can fall as well as rise, and you may lose some or all of the money you invest. Past performance is not a reliable indicator of future results. No return is guaranteed, and unless a product&apos;s published terms expressly say otherwise, funds are not covered by any deposit insurance or investor-compensation scheme. Only invest money you can afford to lose and seek independent advice if you are unsure. Read the full <Link href="/risk-disclosure" className="text-silver-300 underline underline-offset-2 hover:text-white">Risk Disclosure</Link>.
          </p>
          <p>
            <strong className="text-silver-300">Regulatory information.</strong>{" "}
            {company.regulator.name && company.regulator.licenceNumber
              ? <>Registered with {company.regulator.name}, ref. {company.regulator.licenceNumber}. </>
              : <>KVESTY&apos;s registration and licensing status is set out on the <Link href="/regulatory-information" className="text-silver-300 underline underline-offset-2 hover:text-white">Regulatory Information</Link> page. We do not claim any approval that is not shown there. </>}
            Availability of services depends on your location and on applicable law.
          </p>
          <p className="pt-2 text-silver-600">© {new Date().getFullYear()} KVESTY. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-xs font-semibold uppercase tracking-[.2em] text-silver-200">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((l) => <li key={l.href}><Link href={l.href} className="text-silver-500 hover:text-white">{l.label}</Link></li>)}
      </ul>
    </nav>
  );
}
