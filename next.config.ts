import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Static CSP (no per-request nonce, so public pages can stay statically cached at the CDN).
// Turnstile needs challenges.cloudflare.com for script + frame.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

// Anything authenticated or personal must never be stored by a shared cache (Cloudflare, browsers on shared PCs).
const noStore = [{ key: "Cache-Control", value: "private, no-store, max-age=0" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "standalone", // small Node image for Docker/VPS/Fly/Railway (see docs/CLOUDFLARE.md)
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/dashboard/:path*", headers: noStore },
      { source: "/admin/:path*", headers: noStore },
      { source: "/api/:path*", headers: noStore },
      { source: "/login", headers: noStore },
      { source: "/register", headers: noStore },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
