"use client";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Field, TextArea, Alert } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { postJson, type ApiError } from "@/lib/client-api";

type Res = { ok: true; data: Record<string, unknown> } | { ok: false; error: ApiError };

/** Shared submit state: busy / error / field errors, refreshing server data on success. */
function useAction(onOk?: (d: Record<string, unknown>) => void) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [done, setDone] = useState("");
  async function run(p: Promise<Res>, success = "Saved.") {
    setBusy(true); setError(""); setFields({}); setDone("");
    const r = await p; setBusy(false);
    if (!r.ok) { setError(r.error.message); setFields(r.error.fields ?? {}); return false; }
    setDone(success); onOk?.(r.data); router.refresh(); return true;
  }
  return { busy, error, fields, done, run };
}


export function FundingForm({ kind }: { kind: "deposit" | "withdrawal" }) {
  const a = useAction();
  return (
    <form className="card max-w-md space-y-5 p-6" onSubmit={(e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)); a.run(postJson("/api/me/funding", { ...f, kind }), "Request submitted."); }}>
      {a.error && <Alert kind="error">{a.error}</Alert>}{a.done && <Alert kind="success">{a.done}</Alert>}
      <Field label="Amount (USD)" name="amount" inputMode="decimal" placeholder="0.00" required error={a.fields.amount} />
      <TextArea label="Note (optional)" name="note" className="[&_textarea]:min-h-[80px]" error={a.fields.note} />
      <p className="text-xs text-silver-500">Submitting a request does not move funds. Requests are reviewed, and settlement happens only through our verified payment and custody providers.</p>
      <Button type="submit" disabled={a.busy}>{a.busy ? <Loader2 size={16} className="animate-spin" /> : null} Submit {kind} request</Button>
    </form>
  );
}

export function MarkAllRead() {
  const a = useAction();
  return <Button variant="secondary" disabled={a.busy} onClick={() => a.run(postJson("/api/me/notifications"))}>Mark all as read</Button>;
}

export function TicketForm() {
  const a = useAction();
  return (
    <form className="card space-y-5 p-6" onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; const f = Object.fromEntries(new FormData(form)); if (await a.run(postJson("/api/me/support", f), "Request sent.")) form.reset(); }}>
      <h2 className="text-lg font-semibold">New support request</h2>
      {a.error && <Alert kind="error">{a.error}</Alert>}{a.done && <Alert kind="success">{a.done}</Alert>}
      <Field label="Subject" name="subject" required error={a.fields.subject} />
      <TextArea label="How can we help?" name="message" required error={a.fields.message} />
      <Button type="submit" disabled={a.busy}>{a.busy ? <Loader2 size={16} className="animate-spin" /> : null} Send</Button>
    </form>
  );
}

export function ReplyForm({ url }: { url: string }) {
  const a = useAction();
  return (
    <form className="mt-4 space-y-3" onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; const f = Object.fromEntries(new FormData(form)); if (await a.run(postJson(url, f))) form.reset(); }}>
      {a.error && <Alert kind="error">{a.error}</Alert>}
      <TextArea label="Reply" name="message" required className="[&_textarea]:min-h-[90px]" error={a.fields.message} />
      <Button type="submit" variant="secondary" disabled={a.busy}>Send reply</Button>
    </form>
  );
}

export function PasswordForm() {
  const a = useAction();
  return (
    <form className="card max-w-md space-y-5 p-6" onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; const f = Object.fromEntries(new FormData(form)) as Record<string, string>; if (await a.run(postJson("/api/auth/password", { current: f.current, next: f.next }), "Password changed. Other devices were signed out.")) form.reset(); }}>
      <h2 className="text-lg font-semibold">Change password</h2>
      {a.error && <Alert kind="error">{a.error}</Alert>}{a.done && <Alert kind="success">{a.done}</Alert>}
      <Field label="Current password" name="current" type="password" autoComplete="current-password" required error={a.fields.current} />
      <Field label="New password" name="next" type="password" autoComplete="new-password" minLength={12} required error={a.fields.next} hint="At least 12 characters." />
      <Button type="submit" disabled={a.busy}>Update password</Button>
    </form>
  );
}

export function MfaPanel({ enabled, staff }: { enabled: boolean; staff: boolean }) {
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const a = useAction((d) => { if (d.backupCodes) { setCodes(d.backupCodes as string[]); setSetup(null); } });
  return (
    <section className="card max-w-xl space-y-5 p-6" aria-labelledby="mfa-h">
      <h2 id="mfa-h" className="text-lg font-semibold">Two-factor authentication</h2>
      {a.error && <Alert kind="error">{a.error}</Alert>}
      {codes && (
        <Alert kind="success">
          <p className="font-semibold">Two-factor authentication is on. Save your backup codes now — they are shown only once.</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-white">{codes.map((c) => <li key={c}>{c}</li>)}</ul>
        </Alert>
      )}
      {enabled && !codes && (
        <>
          <Alert kind="success">Two-factor authentication is on.</Alert>
          {staff ? <p className="text-sm text-silver-500">Staff accounts must keep two-factor authentication enabled.</p> : (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>; a.run(postJson("/api/auth/mfa/disable", { code: f.code }), "Two-factor authentication turned off."); }}>
              <Field label="Enter a current code to turn it off" name="code" inputMode="numeric" autoComplete="one-time-code" required error={a.fields.code} />
              <Button variant="danger" type="submit" disabled={a.busy}>Turn off</Button>
            </form>
          )}
        </>
      )}
      {!enabled && !setup && (
        <>
          <p className="text-sm text-silver-400">Protect your account with a time-based code from an authenticator app (Google Authenticator, Authy, 1Password, etc.).</p>
          <Button disabled={a.busy} onClick={async () => { const r = await postJson<{ qr: string; secret: string }>("/api/auth/mfa/setup"); if (r.ok) setSetup(r.data); else a.run(Promise.resolve(r)); }}>Set up two-factor authentication</Button>
        </>
      )}
      {!enabled && setup && (
        <div className="space-y-4">
          <p className="text-sm text-silver-400">Scan this QR code with your authenticator app, then enter the 6-digit code it shows.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} alt="QR code for authenticator app" width={220} height={220} className="rounded-xl bg-white p-2" />
          <p className="text-xs text-silver-500">Can&apos;t scan? Enter this key manually: <code className="select-all break-all text-silver-200">{setup.secret}</code></p>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>; a.run(postJson("/api/auth/mfa/enable", { code: f.code })); }}>
            <Field label="6-digit code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required error={a.fields.code} />
            <Button type="submit" disabled={a.busy}>Verify and turn on</Button>
          </form>
        </div>
      )}
    </section>
  );
}

export type { ReactNode };