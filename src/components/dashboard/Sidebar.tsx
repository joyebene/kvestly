"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, UserRound, BadgeCheck, PieChart, History, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, Bell, LifeBuoy, ShieldCheck, Users, Package, Inbox, MessageSquare, FileText, ScrollText, KeyRound, ArrowLeft, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { postJson } from "@/lib/client-api";
import { cn } from "@/lib/cn";

const icons: { [key: string]: LucideIcon } = {
  LayoutDashboard,
  UserRound,
  BadgeCheck,
  PieChart,
  History,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  LifeBuoy,
  ShieldCheck,
  Users,
  Package,
  Inbox,
  MessageSquare,
  FileText,
  ScrollText,
  KeyRound,
  ArrowLeft,
};

export interface NavItem { href: string; label: string; icon: string }

export function Sidebar({ items, name, sub, area }: { items: NavItem[]; name: string; sub: string; area: "Client" | "Admin" }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  async function logout() { await postJson("/api/auth/logout"); router.replace("/login"); router.refresh(); }
  const nav = (
    <nav aria-label={`${area} navigation`} className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {items.map((i) => {
        const active = i.href === path || (i.href !== "/dashboard" && i.href !== "/admin" && path.startsWith(i.href));
        const IconComponent = icons[i.icon];
        return (
          <Link key={i.href} href={i.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium", active ? "bg-electric/15 text-white ring-1 ring-electric/30" : "text-silver-400 hover:bg-white/5 hover:text-white")}>
            {IconComponent && <IconComponent size={18} aria-hidden />} {i.label}
          </Link>
        );
      })}
    </nav>
  );
  const user = (
    <div className="border-t border-white/[.07] p-4">
      <p className="truncate text-sm font-medium text-white">{name}</p><p className="truncate text-xs text-silver-500">{sub}</p>
      <button onClick={logout} className="mt-3 flex items-center gap-2 text-xs font-medium text-silver-400 hover:text-white"><LogOut size={14} aria-hidden /> Sign out</button>
    </div>
  );
  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[.07] bg-navy-950/90 px-4 backdrop-blur lg:hidden">
        <Logo height={34} href={area === "Admin" ? "/admin" : "/dashboard"} />
        <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="p-2 text-white">{open ? <X /> : <Menu />}</button>
      </header>
      <aside className={cn("fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-white/[.07] bg-navy-900 pt-16 transition-transform lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:pt-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="hidden h-[72px] items-center gap-3 px-5 lg:flex"><Logo height={38} href="/" /><span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-silver-300">{area}</span></div>
        {nav}{user}
      </aside>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}