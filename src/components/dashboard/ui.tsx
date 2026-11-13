
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import type {
  ReactNode,
  InputHTMLAttributes,
  ButtonHTMLAttributes,
} from "react";

// Page title
export function PageTitle({
  title,
  intro,
  action,
}: {
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-2 max-w-2xl text-sm text-silver-500">
            {intro}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// Empty state
export function EmptyState({
  icon: I,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card grid place-items-center px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 text-silver-400">
        <I size={22} aria-hidden />
      </span>

      <p className="mt-5 font-display text-lg text-white">
        {title}
      </p>

      {children && (
        <p className="mt-2 max-w-md text-sm text-silver-500">
          {children}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// Badge
const tone: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-300",
  completed: "bg-emerald-500/15 text-emerald-300",
  settled: "bg-emerald-500/15 text-emerald-300",
  active: "bg-emerald-500/15 text-emerald-300",
  published: "bg-emerald-500/15 text-emerald-300",
  resolved: "bg-emerald-500/15 text-emerald-300",

  pending: "bg-amber-500/15 text-amber-300",
  under_review: "bg-amber-500/15 text-amber-300",
  in_review: "bg-amber-500/15 text-amber-300",
  open: "bg-amber-500/15 text-amber-300",
  new: "bg-amber-500/15 text-amber-300",

  awaiting_client: "bg-sky-500/15 text-sky-300",
  in_progress: "bg-sky-500/15 text-sky-300",

  rejected: "bg-red-500/15 text-red-300",
  failed: "bg-red-500/15 text-red-300",
  suspended: "bg-red-500/15 text-red-300",
  spam: "bg-red-500/15 text-red-300",

  cancelled: "bg-white/10 text-silver-400",
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        tone[value] ?? "bg-white/10 text-silver-300"
      )}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

// Statistics
export function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-silver-500">
        {label}
      </p>

      <div className="mt-3 font-display text-2xl font-semibold text-white">
        {value}
      </div>

      {note && (
        <p className="mt-1.5 text-xs text-silver-500">
          {note}
        </p>
      )}
    </div>
  );
}

// Table
export function Table({
  head,
  children,
  empty,
}: {
  head: string[];
  children: ReactNode;
  empty?: ReactNode;
}) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/[.07] text-xs uppercase tracking-[.14em] text-silver-500">
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-5 py-3.5 font-semibold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/[.05] text-silver-300">
          {children}
        </tbody>
      </table>

      {empty}
    </div>
  );
}

// Table cell
export const Td = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <td className={cn("px-5 py-3.5 align-top", className)}>
    {children}
  </td>
);

// Form field
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | string[];
}

export function Field({
  label,
  error,
  className,
  id,
  ...props
}: FieldProps) {
  const fieldId = id || props.name;

  const errorMessage = Array.isArray(error)
    ? error.join(", ")
    : error;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-silver-300"
      >
        {label}
        {props.required && (
          <span className="ml-1 text-red-400">*</span>
        )}
      </label>

      <input
        {...props}
        id={fieldId}
        aria-invalid={!!errorMessage}
        aria-describedby={
          errorMessage ? `${fieldId}-error` : undefined
        }
        className={cn(
          "w-full rounded-lg border bg-white/[.04] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-silver-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50",
          errorMessage
            ? "border-red-500"
            : "border-white/10",
          className
        )}
      />

      {errorMessage && (
        <p
          id={`${fieldId}-error`}
          className="text-xs text-red-400"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#0b1713] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

// Alert
export function Alert({
  kind = "error",
  children,
}: {
  kind?: "success" | "error" | "warning" | "info";
  children: ReactNode;
}) {
  const styles = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    error: "border-red-500/20 bg-red-500/10 text-red-300",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    info: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  };

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        styles[kind]
      )}
    >
      {children}
    </div>
  );
}

// Loading icon
export { Loader2 };
