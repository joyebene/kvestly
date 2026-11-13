import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface Common { label: string; name: string; error?: string; hint?: ReactNode }

export function Field({ label, name, error, hint, className, ...p }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-silver-200">{label}{p.required && <span className="text-electric-400" aria-hidden> *</span>}</label>
      <input id={name} name={name} className="input" aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-err` : hint ? `${name}-hint` : undefined} {...p} />
      {hint && !error && <p id={`${name}-hint`} className="mt-1.5 text-xs text-silver-600">{hint}</p>}
      {error && <p id={`${name}-err`} role="alert" className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function TextArea({ label, name, error, hint, className, ...p }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-silver-200">{label}{p.required && <span className="text-electric-400" aria-hidden> *</span>}</label>
      <textarea id={name} name={name} className={cn("input min-h-[140px] resize-y")} aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-err` : undefined} {...p} />
      {error && <p id={`${name}-err`} role="alert" className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  const c = { error: "border-red-400/30 bg-red-500/10 text-red-200", success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200", info: "border-electric/30 bg-electric/10 text-silver-200" }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-3 text-sm", c)}>{children}</div>;
}
