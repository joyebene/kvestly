import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageTitle({ title, intro, action }: { title: string; intro?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>{intro && <p className="mt-2 max-w-2xl text-sm text-silver-500">{intro}</p>}</div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: I, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card grid place-items-center px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 text-silver-400"><I size={22} aria-hidden /></span>
      <p className="mt-5 font-display text-lg text-white">{title}</p>
      {children && <p className="mt-2 max-w-md text-sm text-silver-500">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

const tone: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-300", completed: "bg-emerald-500/15 text-emerald-300", settled: "bg-emerald-500/15 text-emerald-300", active: "bg-emerald-500/15 text-emerald-300", published: "bg-emerald-500/15 text-emerald-300", resolved: "bg-emerald-500/15 text-emerald-300",
  pending: "bg-amber-500/15 text-amber-300", under_review: "bg-amber-500/15 text-amber-300", in_review: "bg-amber-500/15 text-amber-300", open: "bg-amber-500/15 text-amber-300", new: "bg-amber-500/15 text-amber-300", awaiting_client: "bg-sky-500/15 text-sky-300", in_progress: "bg-sky-500/15 text-sky-300",
  rejected: "bg-red-500/15 text-red-300", failed: "bg-red-500/15 text-red-300", suspended: "bg-red-500/15 text-red-300", spam: "bg-red-500/15 text-red-300", cancelled: "bg-white/10 text-silver-400",
};
export function Badge({ value }: { value: string }) {
  return <span className={cn("inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium capitalize", tone[value] ?? "bg-white/10 text-silver-300")}>{value.replace(/_/g, " ")}</span>;
}

export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-[.16em] text-silver-500">{label}</p>
      <div className="mt-3 font-display text-2xl font-semibold text-white">{value}</div>{note && <p className="mt-1.5 text-xs text-silver-500">{note}</p>}</div>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead><tr className="border-b border-white/[.07] text-xs uppercase tracking-[.14em] text-silver-500">{head.map((h) => <th key={h} scope="col" className="px-5 py-3.5 font-semibold">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-white/[.05] text-silver-300">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}
export const Td = ({ children, className }: { children: ReactNode; className?: string }) => <td className={cn("px-5 py-3.5 align-top", className)}>{children}</td>;
