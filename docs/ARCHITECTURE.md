# Architecture

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 3 · Lucide · MongoDB via Mongoose · Zod · jose · otplib · bcryptjs. Backend = Next.js Route Handlers (no separate server).

> Next.js 16 notes: `middleware` is now `proxy`; `params`/`searchParams`/`cookies()`/`headers()` are async; `next lint` is gone (use `eslint`). See `AGENTS.md`.

## Site map
Public (`src/app/(site)`): `/`, `/about`, `/vision`, `/mission`, `/services`, `/transparency`, `/how-it-works`, `/investment-opportunities`, `/contact`, `/privacy-policy`, `/terms-and-conditions`, `/risk-disclosure`, `/regulatory-information`
Auth (`(auth)`): `/login`, `/register`
Client dashboard: `/dashboard` + `profile, verification, portfolio, history, transactions, deposits, withdrawals, notifications, support, security`
Admin: `/admin` + `users, verification, products, transactions, requests, communications, content, audit-logs, roles`
Demo: `/demo` (flagged, sample data only)

## Layout
```
src/
  app/            routes (site, auth, dashboard, admin, demo, api)
  components/     ui/ layout/ sections/ forms/ dashboard/ admin/
  content/        site copy + legal drafts (data, not JSX)
  lib/            db, session, rbac, api (route wrapper), audit, rate-limit, turnstile,
                  crypto, mfa, ledger, validators, company, features
  models/         Mongoose schemas
scripts/          seed-admin, sync-indexes
docs/             this folder
```

## Request pipeline — `handle()` in `src/lib/api.ts`
Origin check (non-GET) → DB connect → IP rate limit → authenticate (opaque cookie → `Session` → `User`) → staff MFA gate → permission check (+audit on deny) → per-user rate limit → body size cap → Turnstile → Zod parse (strips unknown keys) → handler → JSON with `Cache-Control: private, no-store`. Errors are normalised; 500s never leak internals.

## Data model (MongoDB)
`User`(role, mfa{…encrypted}, kycStatus, lockout) · `Session`(hashed token, TTL) · `AuditLog`(append-only) · `LedgerEntry`(append-only, integer minor units, provider ref unique) · `FundingRequest` · `KycSubmission`(metadata only) · `InvestmentProduct`(disclosures + four-eyes) · `Notification` · `SupportTicket` · `ContactMessage` · `ContentBlock` · `RateLimit`(TTL)

## RBAC
Roles: client, support, compliance, finance, admin, superadmin. Permissions are code-defined in `src/lib/rbac.ts` (matrix visible at `/admin/roles`). Staff: MFA mandatory, 8 h absolute / 30 min idle sessions. Admin area returns 404 to non-staff.

## Integrating providers later
- **Payments / custody / investment execution:** build webhook route handlers that (1) verify the provider's signature, (2) call `recordLedgerEntry()` with the provider reference, (3) update `FundingRequest.status`. Keep all credentials in env vars named in `.env.example`; store only provider-issued references.
- **KYC:** replace the manual form with the provider's hosted flow; store `provider`/`providerRef`/`documentRefs` on `KycSubmission`; set `FEATURE_KYC=true`.
- **Email:** add a provider, then verification + password-reset + notification emails.
- **Feature gating:** `FEATURE_REGISTRATION | FEATURE_KYC | FEATURE_FUNDING_REQUESTS | FEATURE_DEMO_ENVIRONMENT`.

## Design system
Tokens in `tailwind.config.ts` derived from the logo: navy 950–600, electric `#2f7bff`, royal `#1d4ed8`, silver ramp; Sora (display) + Inter (body), self-hosted via Fontsource (no third-party font requests, tighter CSP). Components: `Button`, `Section/PageHero`, `Reveal`, `Card` utilities, `Field/TextArea/Alert`, dashboard `ui` kit. Motion is subtle and disabled under `prefers-reduced-motion`.

## Logo handling
The supplied artwork (`public/kvesty-logo.png`) is used **unmodified** (loading screen, social image). `public/brand/*` are straight pixel crops of it (no recolouring, redrawing or scaling distortion) for nav/footer/mark; aspect ratios are preserved in `components/layout/Logo.tsx`. Favicons in `src/app/icon.png` / `apple-icon.png` were already in the project.
