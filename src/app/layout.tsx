import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "./globals.css";
import { siteUrl, company } from "@/lib/company";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "KVESTY — Invest. Trade. Grow.", template: "%s | KVESTY" },
  description: "KVESTY is an investment-focused company concentrating on cryptocurrency, digital assets and evolving financial markets — built on transparency, risk awareness and accountability.",
  applicationName: "KVESTY",
  openGraph: { type: "website", siteName: "KVESTY", title: "KVESTY — Invest. Trade. Grow.", description: "Your Trusted Investment Partner.", images: [{ url: "/kvesty-logo.png", width: 1080, height: 720, alt: "KVESTY" }] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#030818", width: "device-width", initialScale: 1 };

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.name,
  url: siteUrl,
  logo: `${siteUrl}/brand/kvesty-logo-lockup.png`,
  slogan: company.tagline,
  foundingDate: String(company.founded),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-navy-900">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
