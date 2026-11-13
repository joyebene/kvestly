"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { Field, Alert } from "./Field";
import { Turnstile } from "./Turnstile";
import { Button } from "@/components/ui/Button";
import { postJson } from "@/lib/client-api";

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [reset, setReset] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const onToken = useCallback((t: string | null) => setToken(t), []);
  return { busy, setBusy, error, setError, fields, setFields, reset, bump: () => setReset((n) => n + 1), token, onToken };
}

export function LoginForm() {
  const router = useRouter();
  const s = useSubmit();
  const [mfa, setMfa] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    s.setBusy(true); s.setError(""); s.setFields({});
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (mfa) {
      const r = await postJson<{ redirect: string }>("/api/auth/login/mfa", { code: f.code });
      s.setBusy(false);
      if (!r.ok) { s.setError(r.error.message); if (r.error.code === "mfa_expired") setMfa(false); return; }
      router.replace(r.data.redirect); router.refresh(); return;
    }
    const r = await postJson<{ mfaRequired?: boolean; redirect?: string }>("/api/auth/login", { email: f.email, password: f.password, turnstileToken: s.token ?? undefined });
    s.setBusy(false);
    if (!r.ok) { s.setError(r.error.message); s.setFields(r.error.fields ?? {}); s.bump(); return; }
    if (r.data.mfaRequired) { setMfa(true); return; }
    router.replace(r.data.redirect ?? "/dashboard"); router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-busy={s.busy}>
      {s.error && <Alert kind="error">{s.error}</Alert>}
      {!mfa ? (
        <>
          <Field label="Email address" name="email" type="email" autoComplete="email" required error={s.fields.email} />
          <Field label="Password" name="password" type="password" autoComplete="current-password" required error={s.fields.password} />
          <Turnstile onToken={s.onToken} resetKey={s.reset} />
        </>
      ) : (
        <>
          <Alert kind="info">Enter the 6-digit code from your authenticator app, or one of your backup codes.</Alert>
          <Field label="Authentication code" name="code" inputMode="text" autoComplete="one-time-code" autoFocus required />
        </>
      )}
      <Button type="submit" disabled={s.busy} className="w-full">{s.busy ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : mfa ? "Verify and sign in" : "Sign in"}</Button>
      {!mfa && <p className="text-center text-sm text-silver-500">New to KVESTY? <Link href="/register" className="font-medium text-electric-300 hover:text-white">Open an account</Link></p>}
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const s = useSubmit();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    s.setBusy(true); s.setError(""); s.setFields({});
    const fd = new FormData(e.currentTarget);
    const body = {
      fullName: String(fd.get("fullName") ?? ""), email: String(fd.get("email") ?? ""), password: String(fd.get("password") ?? ""),
      acceptTerms: fd.get("acceptTerms") === "on", acknowledgeRisk: fd.get("acknowledgeRisk") === "on", turnstileToken: s.token ?? undefined,
    };
    if (String(fd.get("confirm")) !== body.password) { s.setBusy(false); s.setFields({ confirm: "Passwords do not match." }); return; }
    const r = await postJson<{ redirect: string }>("/api/auth/register", body);
    s.setBusy(false);
    if (!r.ok) { s.setError(r.error.message); s.setFields(r.error.fields ?? {}); s.bump(); return; }
    router.replace(r.data.redirect); router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-busy={s.busy}>
      {s.error && <Alert kind="error">{s.error}</Alert>}
      <Field label="Full name" name="fullName" autoComplete="name" required error={s.fields.fullName} />
      <Field label="Email address" name="email" type="email" autoComplete="email" required error={s.fields.email} />
      <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={12} required error={s.fields.password} hint="At least 12 characters. A passphrase works well." />
      <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" required error={s.fields.confirm} />
      <div className="space-y-3 text-sm text-silver-400">
        <label className="flex items-start gap-3"><input type="checkbox" name="acceptTerms" required className="mt-1 h-4 w-4 accent-electric" /><span>I accept the <Link href="/terms-and-conditions" target="_blank" className="text-electric-300 underline">Terms</Link> and <Link href="/privacy-policy" target="_blank" className="text-electric-300 underline">Privacy Policy</Link>.</span></label>
        <label className="flex items-start gap-3"><input type="checkbox" name="acknowledgeRisk" required className="mt-1 h-4 w-4 accent-electric" /><span>I have read the <Link href="/risk-disclosure" target="_blank" className="text-electric-300 underline">Risk Disclosure</Link> and understand I could lose money.</span></label>
        {(s.fields.acceptTerms || s.fields.acknowledgeRisk) && <p role="alert" className="text-xs text-red-300">{s.fields.acceptTerms ?? s.fields.acknowledgeRisk}</p>}
      </div>
      <Turnstile onToken={s.onToken} resetKey={s.reset} />
      <Button type="submit" disabled={s.busy} className="w-full">{s.busy ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : "Create account"}</Button>
      <p className="text-center text-sm text-silver-500">Already registered? <Link href="/login" className="font-medium text-electric-300 hover:text-white">Sign in</Link></p>
    </form>
  );
}
