import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/company";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api", "/demo", "/login", "/register"] }], sitemap: `${siteUrl}/sitemap.xml` };
}
