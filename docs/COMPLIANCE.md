# Regulatory & compliance notes — READ BEFORE LAUNCH

> I am not a lawyer and this is not legal advice. It records what was found in research (November 2026) and what the platform is designed to enforce. Have a securities/fintech lawyer in **each** target jurisdiction confirm every point.

## 1. Items flagged for independent verification

### 1.1 The proposed "100% return every two weeks" — **not published, recommend dropping**
- It does not appear anywhere on the site, in code, or in seed data. The Investment Information page shows only the **proposed $1,000 minimum**, labelled "proposed / not final".
- A fixed ~100% fortnightly return (≈ 2,500%+ compounded over a year) is not achievable by any legitimate investment and is the textbook signature of a Ponzi/HYIP scheme. Nigeria's SEC has stated that digital-asset platforms operating without registration are illegal and has acted against such schemes; comparable regulators (FCA, SEC-US, ASIC, etc.) treat such promises as fraud indicators.
- Publishing or promising it — even "target", "up to", or "projected" — could expose the company **and its directors** to criminal and civil liability. The platform enforces this technically: product text matching "guarantee(d)", "risk-free", "assured returns", "double your money", "100% return/ROI" is **rejected** in the admin product form, on submission, on publication, and in CMS content.
- If the company holds a genuine, evidenced strategy with audited performance, that must be presented only with basis, period, fees, risks and a "past performance is not a guide" statement, after legal approval.

### 1.2 Items the company must supply (nothing has been invented)
Legal name · registration number · registered address · phone/email · regulator name & licence/registration number · public-register URL · named data-protection contact · social links. All are `null` / "Not yet published" until set via environment variables (`src/lib/company.ts`).

### 1.3 Claims deliberately **not** made
Regulatory approval, licences, partnerships, insurance, AUM, client numbers, testimonials, performance, "secure custody", live market data. The footer states funds are not covered by deposit insurance/compensation unless a product's published terms say otherwise.

## 2. Nigeria (home jurisdiction) — summary of research
- **Investments and Securities Act 2025** (signed March 2025) repeals ISA 2007 and defines securities to include **virtual and digital assets** (s.357 per law-firm commentary). Digital-asset exchanges, VASPs and DAOPs must be registered with the **SEC Nigeria**; offering/issuing digital assets to the public needs prior SEC registration of the asset.
- SEC's **Rules on Issuance, Offering Platforms and Custody of Digital Assets (May 2022)** set registration, custody, AML/CFT and disclosure requirements; the **ARIP** (Accelerated Regulatory Incubation Program) is the route to approval-in-principle before full registration.
- **Minimum capital**: reported as ₦500m for VASPs under earlier guidance, with **revised minimum-capital requirements issued in 2026** (compliance deadline reported as 30 June 2027). **Confirm the current figure and category with the SEC/counsel** — do not rely on this summary.
- Also relevant: **NDPA 2023** (Nigeria Data Protection Act; registration with the NDPC as a data controller of major importance may apply), **Money Laundering (Prevention and Prohibition) Act** / **SCUML-NFIU** reporting, CBN rules on banks' dealings with crypto firms (eased Dec 2023), **CAC** company registration, tax (FIRS / digital-asset taxation).
- **Until registered/approved (or under an approved ARIP), do not accept deposits, pool funds, or invite the public to invest.** The pre-launch banner, disabled funding flows and `FEATURE_*` flags exist for this reason.

## 3. Other likely jurisdictions (indicative only — verify)
| Region | Typical gating requirement |
|---|---|
| UK | FCA registration under the Money Laundering Regulations for cryptoasset businesses; financial-promotion rules (promotions must be approved/communicated by an authorised person; risk warnings, cooling-off); marketing to UK users without this is a criminal offence |
| EU/EEA | **MiCA** authorisation as a crypto-asset service provider (CASP); AML (6AMLD / Travel Rule) |
| USA | Federal securities law (investment contracts), **FinCEN MSB** registration, state money-transmitter licences, CFTC for derivatives; **geo-block until advised** |
| UAE | VARA (Dubai) / ADGM-FSRA / SCA licensing depending on activity |
| Everywhere | Sanctions screening, KYC/AML/CTF programme, Travel Rule, local data-protection law (GDPR/UK-GDPR, etc.) |

**Product implication:** `Regulatory Information` page and `InvestmentProduct.jurisdictions` exist so availability can be stated per country. Add geo-restriction (Cloudflare WAF country rules + in-app eligibility check) once the permitted list is known.

## 4. How the code enforces the brief

| Requirement | Implementation |
|---|---|
| No fabricated balances/transactions | Dashboard reads only `LedgerEntry`; empty states otherwise. Demo data lives only at `/demo`, banner + watermark, off with `FEATURE_DEMO_ENVIRONMENT=false` |
| Admins cannot fabricate transactions | No API creates ledger entries. `recordLedgerEntry()` requires a provider reference and an audit record written first (fails closed). Ledger & audit models reject update/delete in the ORM |
| Every sensitive admin action permission-controlled + logged | `handle({auth:{permission}})` → 403 + `authz.denied` audit; `audit(..., {critical:true})` aborts the action if the log write fails |
| Funding can't be faked | Request approval ≠ money movement; `completed` is not settable by staff |
| Four-eyes on publishing | Creator ≠ publisher; compliance reference required |
| No keys/seed phrases/payment creds stored | No such fields exist; UI warns users never to send them; payouts use provider-issued references only |
| KYC documents | Metadata only; documents belong in encrypted object storage / KYC provider (not wired) |
| Auth | bcrypt(12) hashes; opaque revocable sessions (hashed in DB); `__Host-` cookie; TOTP MFA with replay protection + hashed backup codes; mandatory for staff; lockout + rate limits; generic errors + timing equalisation |
| Input / injection / XSS | Zod validation, unknown keys stripped (blocks Mongo operator injection), React escaping, strict CSP, no `dangerouslySetInnerHTML` except JSON-LD (escaped) |
| CSRF | SameSite=Lax cookie + Origin allow-list on every mutating route |
| No caching of private data | `Cache-Control: private, no-store` on `/api`, `/dashboard`, `/admin`, auth pages; Cloudflare bypass rules |

## 5. Known gaps before real-money operation (honest list)
1. **Email**: no provider wired → no email verification, password reset or contact-form email notifications yet. Registration therefore reveals "account may exist" (rate-limited + Turnstile). Add a provider, verification & reset flows.
2. **KYC/AML provider & document storage**: not integrated. Sanctions/PEP screening, transaction monitoring and SAR workflows not built.
3. **Payments/custody/investment providers**: none connected; ledger writer has no callers yet. Needs webhook signature verification + reconciliation.
4. **Legal documents** are structured drafts, not legal text.
5. **Audit log tamper-evidence**: append-only in the app layer; add DB-level controls (separate write-only role / hash chain / WORM export).
6. **Rate limiter** is Mongo-backed (adequate for launch); move to Redis/edge if traffic grows.
7. **Penetration test**, backup/restore drill, incident-response plan and DPIA are still to do.
8. No automated tests yet beyond type-check, lint and the smoke checks recorded in the README.
