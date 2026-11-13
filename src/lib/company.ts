/**
 * Single source of truth for company facts.
 * RULE: nothing here may be invented. Unverified values are `null` and the UI
 * renders an explicit "not yet published" state instead of a made-up value.
 */
const v = (x: string | undefined) => (x && x.trim().length > 0 ? x.trim() : null);

export const company = {
  name: "KVESTY",
  tagline: "Invest. Trade. Grow.",
  statement: "Your Trusted Investment Partner.",
  founded: 2019, // supplied by the company in the brief
  proposedMinimumInvestmentUsd: 1000, // proposed only — not an approved product term
  legalName: v(process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME),
  registrationNumber: v(process.env.NEXT_PUBLIC_COMPANY_REG_NUMBER),
  address: v(process.env.NEXT_PUBLIC_COMPANY_ADDRESS),
  phone: v(process.env.NEXT_PUBLIC_COMPANY_PHONE),
  email: v(process.env.NEXT_PUBLIC_COMPANY_EMAIL),
  regulator: {
    name: v(process.env.NEXT_PUBLIC_REGULATOR_NAME),
    licenceNumber: v(process.env.NEXT_PUBLIC_REGULATOR_LICENCE_NUMBER),
    statusUrl: v(process.env.NEXT_PUBLIC_REGULATOR_STATUS_URL),
  },
  social: {
    x: v(process.env.NEXT_PUBLIC_SOCIAL_X),
    linkedin: v(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN),
    instagram: v(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM),
    telegram: v(process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM),
  },
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
