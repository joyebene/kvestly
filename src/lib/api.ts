import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { HttpError } from "./errors";
import { getAuth, type AuthedUser } from "./session";
import { can, isStaff, type Permission } from "./rbac";
import { rateLimit } from "./rate-limit";
import { verifyTurnstile } from "./turnstile";
import { clientIp } from "./ip";
import { audit } from "./audit";
import { connectDb } from "./db";

type Auth = "none" | "user" | { permission: Permission };
interface Opts<S extends z.ZodType | undefined> {
  auth?: Auth;
  schema?: S;
  /** [name, max, windowSec]; keyed by IP, and additionally by user when authenticated */
  limit?: [string, number, number];
  turnstile?: boolean;
  /** For authenticated routes: accept sessions that haven't completed MFA (e.g. MFA enrolment). */
  allowUnverifiedMfa?: boolean;
}
export interface Ctx<S extends z.ZodType | undefined> {
  req: NextRequest;
  ip: string;
  user: AuthedUser;
  body: S extends z.ZodType ? z.output<S> : undefined;
  params: Record<string, string>;
}

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

function originAllowed(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowed = (process.env.ALLOWED_ORIGINS ?? process.env.NEXT_PUBLIC_APP_URL ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!origin) return process.env.NODE_ENV !== "production";
  return allowed.includes(origin) || origin === req.nextUrl.origin;
}

/** Defaults are secure: authenticated, CSRF-checked, rate-limited, validated, never cached. */
export function handle<S extends z.ZodType | undefined = undefined>(
  opts: Opts<S>,
  fn: (c: Ctx<S>) => Promise<unknown>,
) {
  return async (req: NextRequest, route: { params: Promise<Record<string, string>> }) => {
    const ip = clientIp(req.headers);
    try {
      if (!SAFE.has(req.method) && !originAllowed(req)) throw new HttpError(403, "Request origin not allowed.", "bad_origin");
      await connectDb();
      if (opts.limit) await rateLimit(opts.limit[0] + ":ip", ip, opts.limit[1], opts.limit[2]);

      let user = null as AuthedUser | null;
      const auth = opts.auth ?? "user";
      if (auth !== "none") {
        user = await getAuth();
        if (!user) throw new HttpError(401, "Please sign in.", "unauthenticated");
        if (isStaff(user.role) && !opts.allowUnverifiedMfa && !(user.mfaEnabled && user.mfaVerified))
          throw new HttpError(403, "Multi-factor authentication is required.", "mfa_required");
        if (typeof auth === "object" && !can(user.role, auth.permission)) {
          await audit({ action: "authz.denied", actor: { id: user.id, role: user.role }, outcome: "denied", meta: { permission: auth.permission, path: req.nextUrl.pathname }, headers: req.headers });
          throw new HttpError(403, "You do not have permission to do that.", "forbidden");
        }
        if (opts.limit) await rateLimit(opts.limit[0] + ":user", user.id, opts.limit[1] * 2, opts.limit[2]);
      }

      let body: unknown = undefined;
      if (opts.schema || opts.turnstile) {
        const len = Number(req.headers.get("content-length") ?? 0);
        if (len > 65_536) throw new HttpError(413, "Request too large.", "too_large");
        let raw: Record<string, unknown>;
        try { raw = await req.json(); } catch { throw new HttpError(400, "Invalid JSON body.", "bad_json"); }
        if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new HttpError(400, "Invalid body.", "bad_json");
        if (opts.turnstile) await verifyTurnstile(typeof raw.turnstileToken === "string" ? raw.turnstileToken : undefined, ip);
        if (opts.schema) {
          const parsed = opts.schema.safeParse(raw); // unknown keys are stripped → no operator/field injection
          if (!parsed.success) {
            const fields: Record<string, string> = {};
            for (const i of parsed.error.issues) fields[String(i.path[0] ?? "form")] ??= i.message;
            throw new HttpError(422, "Please check the highlighted fields.", "validation", fields);
          }
          body = parsed.data;
        }
      }

      const params = await route.params;
      if (params && params.id && !/^[a-f0-9]{24}$/.test(params.id)) throw new HttpError(404, "Not found.", "not_found");
      const result = await fn({ req, ip, user: user as AuthedUser, body: body as Ctx<S>["body"], params });
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (e) {
      if (e instanceof HttpError) {
        return NextResponse.json({ error: { code: e.code, message: e.message, fields: e.fields } }, { status: e.status, headers: { "Cache-Control": "private, no-store", ...e.headers } });
      }
      console.error("[api]", req.method, req.nextUrl.pathname, e);
      return NextResponse.json({ error: { code: "server_error", message: "Something went wrong. Please try again." } }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
    }
  };
}