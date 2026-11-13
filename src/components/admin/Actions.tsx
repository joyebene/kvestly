"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, Alert } from "@/components/forms/Field";
import { postJson } from "@/lib/client-api";

export interface ActionDef { label: string; url: string; body: Record<string, unknown>; variant?: "primary" | "secondary" | "danger"; note?: "required" | "optional" | "none"; }

/** Sensitive staff actions: explicit button → optional/required reason → POST → server enforces permission + audit. */
export function Actions({ actions }: { actions: ActionDef[] }) {
  const router = useRouter();
  const [active, setActive] = useState<ActionDef | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function go(a: ActionDef) {
    if ((a.note ?? "none") === "required" && note.trim().length < 3) { setErr("A reason is required."); return; }
    setBusy(true); setErr("");
    const r = await postJson(a.url, { ...a.body, note: note.trim() });
    setBusy(false);
    if (!r.ok) { setErr(r.error.message); return; }
    setActive(null); setNote(""); router.refresh();
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button key={a.label} variant={a.variant ?? "secondary"} className="!px-3 !py-1.5 text-xs" disabled={busy}
            onClick={() => (a.note ?? "none") === "none" ? go(a) : (setActive(a), setErr(""))}>{a.label}</Button>
        ))}
      </div>
      {active && (
        <div className="space-y-2 rounded-xl border border-white/10 bg-navy-900 p-3">
          <p className="text-xs font-semibold text-white">{active.label}{active.note === "required" ? " — reason required" : ""}</p>
          <textarea aria-label="Reason" className="input min-h-[70px]" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
          {err && <p role="alert" className="text-xs text-red-300">{err}</p>}
          <div className="flex gap-2"><Button className="!px-3 !py-1.5 text-xs" disabled={busy} onClick={() => go(active)}>Confirm</Button><Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => setActive(null)}>Cancel</Button></div>
        </div>
      )}
      {!active && err && <p role="alert" className="text-xs text-red-300">{err}</p>}
    </div>
  );
}

/** Generic JSON form used by admin: product create, content save, notify. */
export function AdminForm({ url, fields, submit, resetOnOk = true }: {
  url: string; submit: string; resetOnOk?: boolean;
  fields: { name: string; label: string; textarea?: boolean; required?: boolean; type?: string; hint?: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [ok, setOk] = useState(false);
  return (
    <form className="card space-y-4 p-6" onSubmit={async (e) => {
      e.preventDefault(); const form = e.currentTarget; setBusy(true); setErr(""); setErrs({}); setOk(false);
      const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
      const body: Record<string, unknown> = { ...f };
      if (f.minInvestmentUsd) body.minInvestmentUsd = Number(f.minInvestmentUsd);
      body.jurisdictions = []; // Assuming jurisdictions is always an empty array for new products
      if ("published" in f) body.published = f.published?.trim().toLowerCase() === "yes";
      const r = await postJson(url, body); setBusy(false);
      if (!r.ok) { setErr(r.error.message); setErrs(r.error.fields ?? {}); return; }
      setOk(true); if (resetOnOk) form.reset(); router.refresh();
    }}>
      {err && <Alert kind="error">{err}</Alert>}{ok && <Alert kind="success">Saved.</Alert>}
      {fields.map((f) => f.textarea ? <TextArea key={f.name} {...f} error={errs[f.name]} /> : <Field key={f.name} {...f} error={errs[f.name]} />)}
      <Button type="submit" disabled={busy}>{submit}</Button>
    </form>
  );
}