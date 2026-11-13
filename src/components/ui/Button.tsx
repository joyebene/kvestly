import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60";
const variants = {
  primary: "bg-blue-sheen text-white shadow-glow hover:brightness-110 active:brightness-95",
  secondary: "border border-white/15 bg-white/[.04] text-white hover:border-electric/50 hover:bg-white/[.08]",
  ghost: "text-silver-300 hover:text-white",
  danger: "border border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20",
} as const;
type Variant = keyof typeof variants;

export function ButtonLink({ href, variant = "primary", className, children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return <Link href={href} className={cn(base, variants[variant], className)}>{children}</Link>;
}

export function Button({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...p} className={cn(base, variants[variant], className)} />;
}
