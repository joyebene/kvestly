import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/company";
const paths = ["", "/about", "/vision", "/mission", "/services", "/transparency", "/how-it-works", "/investment-opportunities", "/contact", "/privacy-policy", "/terms-and-conditions", "/risk-disclosure", "/regulatory-information"];
export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 }));
}
