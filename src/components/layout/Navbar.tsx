"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const links = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/transparency", label: "Transparency" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/investment-opportunities", label: "Investment Information" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={cn("sticky top-0 z-50 transition duration-300", scrolled || open ? "border-b border-white/[.07] bg-navy-950/85 backdrop-blur-xl" : "bg-transparent")}>
      <nav className="container-x flex h-[72px] items-center justify-between" aria-label="Primary">
        <Logo height={40} priority />
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={path === l.href ? "page" : undefined}
                className={cn("rounded-lg px-3 py-2 text-sm font-medium", path === l.href ? "text-white" : "text-silver-400 hover:text-white")}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink href="/login" variant="ghost" className="!px-3 !py-2">Sign in</ButtonLink>
          <ButtonLink href="/register" className="!py-2.5">Open an account</ButtonLink>
        </div>
        <button className="rounded-lg p-2 text-white lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      <div id="mobile-menu" hidden={!open} className="h-[calc(100dvh-72px)] overflow-y-auto border-t border-white/[.06] bg-navy-950/95 px-5 pb-10 pt-4 lg:hidden">
        <ul className="space-y-1">
          {links.map((l) => (
            <li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3.5 text-lg font-medium text-silver-200 hover:bg-white/5 hover:text-white">{l.label}</Link></li>
          ))}
        </ul>
        <div className="mt-6 grid gap-3" onClick={() => setOpen(false)}>
          <ButtonLink href="/register">Open an account</ButtonLink>
          <ButtonLink href="/login" variant="secondary">Sign in</ButtonLink>
        </div>
      </div>
    </header>
  );
}
