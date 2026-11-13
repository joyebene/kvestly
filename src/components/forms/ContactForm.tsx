"use client";
import { useCallback, useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Field, TextArea, Alert } from "./Field";
import { Turnstile } from "./Turnstile";
import { Button } from "@/components/ui/Button";
import { postJson } from "@/lib/client-api";

type State = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [reset, setReset] = useState(0);
  const onToken = useCallback((t: string | null) => setToken(t), []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const local: Record<string, string> = {};
    if (f.name.trim().length < 2) local.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) local.email = "Enter a valid email address.";
    if (f.phone && !/^\+?[0-9 ()-]{7,20}$/.test(f.phone)) local.phone = "Enter a valid phone number.";
    if (f.subject.trim().length < 3) local.subject = "Please add a subject.";
    if (f.message.trim().length < 10) local.message = "Please write at least 10 characters.";
    setErrors(local);
    if (Object.keys(local).length) return;
    setState("submitting"); setMessage("");
    const r = await postJson("/api/contact", { ...f, turnstileToken: token ?? undefined });
    if (r.ok) { setState("success"); form.reset(); return; }
    setState("error"); setErrors(r.error.fields ?? {}); setMessage(r.error.message); setReset((n) => n + 1);
  }

  if (state === "success") {
    return (
      <div className="card p-10 text-center" role="status">
        <CheckCircle2 className="mx-auto text-emerald-300" size={40} aria-hidden />
        <h3 className="mt-5 text-2xl font-semibold">Message received</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm text-silver-400">Thank you for getting in touch. Our team will review your message and reply by email.</p>
        <Button variant="secondary" className="mt-6" onClick={() => setState("idle")}>Send another message</Button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="card space-y-5 p-6 sm:p-8" aria-busy={state === "submitting"}>
      {state === "error" && message && <Alert kind="error">{message}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" required maxLength={120} error={errors.name} />
        <Field label="Email address" name="email" type="email" autoComplete="email" required maxLength={254} error={errors.email} />
        <Field label="Phone number" name="phone" type="tel" autoComplete="tel" maxLength={20} error={errors.phone} hint="Optional" />
        <Field label="Subject" name="subject" required maxLength={160} error={errors.subject} />
      </div>
      <TextArea label="Message" name="message" required maxLength={5000} error={errors.message} />
      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <Turnstile onToken={onToken} resetKey={reset} />
      <p className="text-xs text-silver-600">By sending this form you agree that we may use your details to respond to you, as described in our Privacy Policy. Please do not include passwords, seed phrases or private keys.</p>
      <Button type="submit" disabled={state === "submitting"} className="w-full sm:w-auto">
        {state === "submitting" ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <>Send message <Send size={16} /></>}
      </Button>
    </form>
  );
}
