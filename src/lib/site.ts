/**
 * Central site configuration.
 *
 * Anything the company has NOT supplied or verified (addresses, phone numbers,
 * registration numbers, licences) is read from environment variables and renders
 * as an explicit "not yet published" state. Never hard-code unverified facts here.
 */

const env = (name: string) => {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
};

export const site = {
  name: "KVESTY",
  tagline: "Invest. Trade. Grow.",
  statement: "Your Trusted Investment Partner",
  description:
    "KVESTY is an investment-focused company concentrating on cryptocurrency, digital assets and evolving financial markets, with a commitment to transparency, risk awareness and informed decision-making.",
  url: env("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  founded: 2019,

  /**
   * Launch status controls how investment-related pages behave.
   * "pre-launch": information only. No sign-up-to-invest flow, no funding.
   * Change ONLY after regulatory authorisation, custody and payment
   * arrangements have been verified (see docs/COMPLIANCE.md).
   */
  launchStatus: (env("NEXT_PUBLIC_LAUNCH_STATUS") ?? "pre-launch") as "pre-launch" | "live",

  contact: {
    email: env("NEXT_PUBLIC_CONTACT_EMAIL"),
    phone: env("NEXT_PUBLIC_CONTACT_PHONE"),
    address: env("NEXT_PUBLIC_COMPANY_ADDRESS"),
    mapUrl: env("NEXT_PUBLIC_MAP_EMBED_URL"),
  },

  social: {
    x: env("NEXT_PUBLIC_SOCIAL_X"),
    linkedin: env("NEXT_PUBLIC_SOCIAL_LINKEDIN"),
    instagram: env("NEXT_PUBLIC_SOCIAL_INSTAGRAM"),
    telegram: env("NEXT_PUBLIC_SOCIAL_TELEGRAM"),
  },

  regulatory: {
    legalName: env("NEXT_PUBLIC_LEGAL_ENTITY_NAME"),
    registrationNumber: env("NEXT_PUBLIC_COMPANY_REG_NUMBER"),
    secNigeriaStatus: env("NEXT_PUBLIC_SEC_NIGERIA_STATUS"),
    otherAuthorisations: env("NEXT_PUBLIC_OTHER_AUTHORISATIONS"),
  },

  /**
   * Proposed by the company; NOT displayed publicly. It may only be shown inside
   * an approved product's terms (see Product.minInvestmentUSD) once verified.
   */
  proposedMinimumInvestmentUSD: 1000,
} as const;

export const navLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/investments", label: "Investments" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/transparency", label: "Transparency" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerLinks = {
  company: [
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Our Services" },
    { href: "/investments", label: "Investment Information" },
    { href: "/contact", label: "Contact Us" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms and Conditions" },
    { href: "/risk-disclosure", label: "Risk Disclosure" },
    { href: "/regulatory", label: "Regulatory Information" },
  ],
} as const;

export const shortRiskNotice =
  "Cryptocurrency and digital assets are highly volatile and speculative. The value of an investment can fall as well as rise and you may lose some or all of the money you invest. Past performance is not a reliable indicator of future results. Nothing on this website is a guarantee of returns, personalised financial advice or an offer to buy or sell any investment.";
