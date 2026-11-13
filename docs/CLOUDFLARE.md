# Cloudflare deployment & security guide

Nothing here has been executed against your Cloudflare account — it is a runbook. Values in `<angle brackets>` are yours to supply. **Never commit tokens or secrets**; set them in your host's secret store.

## 1. Choosing the hosting arrangement

Cloudflare DNS alone does **not** host the app. Three real options:

| | A. Node container behind Cloudflare **(recommended)** | B. Vercel + Cloudflare DNS only | C. Cloudflare Workers (OpenNext) |
|---|---|---|---|
| Where the app runs | Any Node 22 host (Fly.io, Railway, Render, VPS) using the included `Dockerfile` | Vercel | Cloudflare Workers |
| Cloudflare provides | DNS, proxy/CDN, WAF, DDoS, rate limiting, Turnstile, optional Tunnel | DNS (grey-cloud), Turnstile | Everything |
| WAF / rate limits in front of the app | **Yes** | **No** (traffic bypasses Cloudflare if DNS-only; Vercel documents that proxying another CDN in front is not recommended — check their current docs) | Yes |
| Compatibility with this codebase | Full (Mongoose, bcrypt, Node crypto) | Full | **Risky**: Mongoose/MongoDB TCP driver and Node APIs need `nodejs_compat` and are less proven on Workers; needs a spike before committing |
| Maintainability | One Dockerfile | Easiest | More moving parts |

**Recommendation: Option A.** It keeps full Node compatibility for a financial app *and* lets Cloudflare's WAF, DDoS and rate-limiting sit in front. For the strongest posture, use **Cloudflare Tunnel** (`cloudflared`) so the origin has no public IP at all; otherwise use Origin CA + Authenticated Origin Pulls and firewall the origin to Cloudflare IP ranges. If you pick B, you lose the WAF layer — rely on the in-app rate limiting and Turnstile only.

Database: **MongoDB Atlas** (IP access list / private endpoint, TLS, backups, encryption at rest, a least-privilege DB user). Turn on Atlas audit logging if your tier supports it.

## 2. Account & domain

1. Create the Cloudflare account; enable **2FA** and use a hardware key if possible. Create per-person members with least privilege.
2. *Add a site* → enter `<yourdomain.com>` → choose plan → Cloudflare scans existing DNS records.
3. At your registrar, replace nameservers with the two Cloudflare gives you. Wait for "Active".
4. Enable **DNSSEC** (DNS → Settings) and add the DS record at the registrar.
5. Registrar: enable transfer lock + registrar 2FA.

## 3. DNS records

| Type | Name | Content | Proxy | Notes |
|---|---|---|---|---|
| CNAME (Tunnel) or A | `@` | Tunnel `<uuid>.cfargotunnel.com` / origin IP | **Proxied** | Apex is flattened automatically |
| CNAME | `www` | `@` | Proxied | Redirect to apex (§6) |
| CNAME | `app` *(optional)* | as above | Proxied | If you later split the platform to `app.<domain>` |
| TXT | `@` | `v=spf1 include:<email-provider> -all` | – | Once an email provider is chosen |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:<mailbox>` | – | Tighten to `reject` after monitoring |
| TXT/CNAME | provider-specific | DKIM from provider | DNS-only | |
| CAA | `@` | `0 issue "letsencrypt.org"` / `0 issue "pki.goog"` | – | Allow only the CAs Cloudflare uses |

Option B only: point records to Vercel and set them **DNS-only (grey)**.

## 4. SSL/TLS

- SSL/TLS → Overview → **Full (strict)**. (Origin must present a valid cert: Cloudflare **Origin CA** certificate, or use Tunnel which needs none.)
- Edge Certificates: **Always Use HTTPS** on · **Minimum TLS 1.2** · **TLS 1.3** on · **Automatic HTTPS Rewrites** on · Opportunistic Encryption on.
- **HSTS**: the app already sends `Strict-Transport-Security` (see `next.config.ts`). Don't also enable it in Cloudflare unless you remove it from the app. Only add `preload` after you're certain every subdomain is HTTPS.
- Origin: enable **Authenticated Origin Pulls** (SSL/TLS → Origin Server) and require the client cert on your origin proxy, or use Tunnel.
- Mixed content: the app has `upgrade-insecure-requests` in its CSP in production and uses only same-origin / Cloudflare-Turnstile URLs.

## 5. Security

**Security → Settings:** Security level *Medium*; Browser Integrity Check on; Challenge Passage 30 min.

**WAF → Managed rules:** enable *Cloudflare Managed Ruleset* and *OWASP Core Ruleset* (start in *Log*, review a week, then *Block*). Enable *Leaked credentials detection* if your plan has it.

**Custom rules** (WAF → Custom rules; order matters):

1. *Block obvious scanners/exploit paths*
   `(http.request.uri.path matches "(?i)(\\.env|\\.git|wp-admin|wp-login|phpmyadmin|\\.php$)")` → **Block**
2. *Protect the admin surface* (optional but recommended — add your office/VPN IPs to an IP List `office_ips`)
   `(starts_with(http.request.uri.path, "/admin") or starts_with(http.request.uri.path, "/api/admin")) and not ip.src in $office_ips` → **Block** (or *Managed Challenge* if staff travel)
3. *Challenge likely bots on auth/contact*
   `(http.request.uri.path in {"/api/auth/login" "/api/auth/register" "/api/contact"}) and cf.bot_management.score lt 30` → **Managed Challenge** (needs Bot Management; on lower plans use *Super Bot Fight Mode* instead)
4. *Only allow expected methods on the API*
   `(starts_with(http.request.uri.path, "/api/")) and not http.request.method in {"GET" "POST" "HEAD" "OPTIONS"}` → **Block**

**Rate limiting rules** (Security → WAF → Rate limiting rules). These sit *in front of* the app's own MongoDB-backed limiter:

| Match | Threshold | Action |
|---|---|---|
| path in `/api/auth/login`, `/api/auth/login/mfa` | 10 req / 1 min / IP | Block 10 min |
| `/api/auth/register` | 5 req / 10 min / IP | Block 1 h |
| `/api/contact` | 5 req / 10 min / IP | Block 1 h |
| `starts_with(path,"/api/")` (all) | 100 req / 1 min / IP | Managed Challenge |

**DDoS:** the HTTP DDoS managed ruleset is on by default; leave sensitivity defaults, review *Security → Events*.

**Bots:** enable *Bot Fight Mode* (free) or *Super Bot Fight Mode* (Pro+). Keep "Verified bots" allowed so search engines can crawl.

**API endpoint protection:** all `/api/*` responses are `Cache-Control: private, no-store`; every state-changing route enforces an Origin check, auth, input validation and rate limits in code. Optionally use **API Shield → Schema validation** with an OpenAPI spec once the API stabilises.

**Security headers:** already set by the app in `next.config.ts` (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, nosniff). Verify at securityheaders.com after deploy. If you add third-party scripts, extend the CSP deliberately.

**Real client IP:** set `TRUST_CLOUDFLARE_HEADERS=true` **only** when the origin is reachable exclusively through Cloudflare (Tunnel or IP-restricted + Authenticated Origin Pulls). Otherwise an attacker can spoof `CF-Connecting-IP` and evade the in-app rate limiter.

## 6. Turnstile (registration, login, contact — all three are already wired)

1. Cloudflare dashboard → **Turnstile** → *Add widget*. Name `kvesty-prod`. Hostnames: `<yourdomain.com>`, `www.<yourdomain.com>`. Mode **Managed**.
2. Copy the **Site key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public, built into the client).
3. Copy the **Secret key** → `TURNSTILE_SECRET_KEY` (server only; never in git or client code).
4. Create a second widget for staging/dev, or use Cloudflare's published test keys locally.
5. The server verifies every token against `siteverify` and **fails closed in production** if the secret is missing.

## 7. Performance

- **Caching → Configuration:** Browser Cache TTL *Respect existing headers*; Always Online on (static pages only).
- **Cache Rules** (create in this order):
  1. *Bypass cache* — `starts_with(http.request.uri.path,"/dashboard") or starts_with(http.request.uri.path,"/admin") or starts_with(http.request.uri.path,"/api/") or http.request.uri.path in {"/login" "/register"}` → **Bypass cache**. *(Defence in depth: the app also sends `private, no-store` on these.)*
  2. *Cache static assets* — `starts_with(http.request.uri.path,"/_next/static/") or starts_with(http.request.uri.path,"/brand/")` → Eligible for cache, Edge TTL **1 year**, Browser TTL 1 year (files are fingerprinted/immutable).
  3. Leave HTML at the default (not cached) — or, for the public marketing pages only, add an explicit rule with a short Edge TTL (5 min) once you're happy.
- **Never** create a rule that caches by "Cache Everything" across the zone — it would cache personal dashboard HTML.
- **Compression:** Speed → Optimization → *Brotli* on (gzip is automatic).
- **Images:** Next's optimizer handles `next/image` (AVIF/WebP). The brand PNGs are served as-is to keep the logo pixel-exact. Cloudflare *Polish/Image Resizing* are optional paid extras.
- Speed → Optimization: *Early Hints* on, *HTTP/3* on. Leave *Rocket Loader* **off** (it breaks React hydration) and *Auto Minify* off.

**Redirect Rule (www → apex):** Rules → Redirect Rules → `(http.host eq "www.<domain>")` → Dynamic `concat("https://<domain>", http.request.uri.path)`, status 301, preserve query string.

## 8. Environment variables

See `.env.example` for the full list. Required in production:

| Variable | Purpose | Where |
|---|---|---|
| `NEXT_PUBLIC_APP_URL`, `ALLOWED_ORIGINS` | Canonical URL + CSRF origin allow-list (`https://<domain>`) | host env |
| `MONGODB_URI`, `MONGODB_DB` | Atlas connection | **secret** |
| `AUTH_SECRET` | signs the short-lived MFA challenge (`openssl rand -base64 32`) | **secret** |
| `MFA_ENCRYPTION_KEY` | 32-byte base64 key encrypting TOTP secrets (AES-256-GCM). Losing it locks users out of MFA — back it up in a secrets manager | **secret** |
| `RATE_LIMIT_SALT` | HMAC salt for IP/email hashing in rate-limit/audit data | **secret** |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Turnstile | public / **secret** |
| `TRUST_CLOUDFLARE_HEADERS` | see §5 | host env |
| `FEATURE_*` | Feature flags — keep `FEATURE_KYC` and `FEATURE_FUNDING_REQUESTS` **false** until providers + licences exist; set `FEATURE_DEMO_ENVIRONMENT=false` | host env |
| `NEXT_PUBLIC_COMPANY_*`, `NEXT_PUBLIC_REGULATOR_*`, `NEXT_PUBLIC_SOCIAL_*` | Verified company facts; leave blank until verified | host env |
| `NEXT_PUBLIC_PLATFORM_STAGE` | set to `live` only when you are licensed and operational (hides the pre-launch banner) | host env |

`NEXT_PUBLIC_*` values are embedded in client JS — never put a secret in one. Cloudflare API tokens are **not used by the app at all**; if you automate Cloudflare (Terraform/Wrangler), keep the token in CI secrets only, scoped to the single zone.

## 9. Deployment steps (Option A)

```bash
# 1. Build & test locally
cp .env.example .env.local   # fill in
npm ci && npm run typecheck && npm run lint && npm run build

# 2. One-time database setup (trusted shell, production env loaded)
npm run db:indexes
SEED_ADMIN_EMAIL=<you> SEED_ADMIN_PASSWORD='<14+ char passphrase>' npm run seed:admin

# 3. Container
docker build -t kvesty \
  --build-arg NEXT_PUBLIC_APP_URL=https://<domain> \
  --build-arg NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site-key> .
docker run -p 3000:3000 --env-file <runtime-env-file> kvesty
```

4. Deploy the image to your host with runtime secrets injected by the platform.
5. Create the Cloudflare Tunnel (Zero Trust → Networks → Tunnels), run `cloudflared` beside the container, and add a public hostname `<domain>` → `http://localhost:3000`. (Without Tunnel: DNS record → origin IP, Origin CA cert installed, firewall to Cloudflare ranges.)
6. Work through §3–§7, then the checklist below.
7. First staff login: sign in with the seeded account → **Dashboard → Security** → enable 2FA → sign out/in → the Admin console unlocks. Store the backup codes offline.

**Option B (Vercel):** import the repo, set env vars, add the domain in Vercel and create the DNS-only records it asks for. §5 WAF/rate-limit rules will not apply — compensate accordingly.

## 10. Production security checklist

**Edge**
- [ ] Nameservers active; DNSSEC on; registrar 2FA + lock
- [ ] SSL **Full (strict)**, Always HTTPS, TLS ≥ 1.2, AOP or Tunnel
- [ ] Managed + OWASP rulesets enabled (after log-only trial), custom rules §5 added
- [ ] Rate-limit rules §5 added; Bot Fight/Super Bot Fight on
- [ ] Cache rules §7 in place; confirm `curl -I https://<domain>/dashboard` shows `cf-cache-status: DYNAMIC`/`BYPASS`, never `HIT`
- [ ] Rocket Loader / Auto-Minify off
- [ ] Turnstile widgets restricted to your hostnames

**App**
- [ ] All secrets generated fresh for production and stored only in the secret manager
- [ ] `FEATURE_KYC`, `FEATURE_FUNDING_REQUESTS` false; `FEATURE_DEMO_ENVIRONMENT` false
- [ ] `TRUST_CLOUDFLARE_HEADERS=true` only if origin is locked to Cloudflare
- [ ] Seed admin created, 2FA enabled, backup codes stored; seed password rotated
- [ ] securityheaders.com / SSL Labs grade A

**Data**
- [ ] Atlas: IP allow-list/private link, TLS, least-privilege user, encryption at rest, daily backups + tested restore, audit logging
- [ ] `npm run db:indexes` run (autoIndex is off in production)
- [ ] No identity documents stored in MongoDB (use encrypted object storage / a KYC provider)

**Compliance & operations**
- [ ] Legal documents reviewed by counsel; regulatory status published (see `docs/COMPLIANCE.md`)
- [ ] Incident-response and breach-notification plan; log monitoring/alerting; dependency updates (`npm audit`, Dependabot)
- [ ] Penetration test before enabling any real-money feature
