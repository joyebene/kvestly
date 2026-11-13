"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Subtle fade-up on scroll. Content is visible by default (SSR / no-JS / reduced-motion safe). */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.95) return; // already in view
    setHidden(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setHidden(false); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={cn("transition duration-700 ease-out", hidden ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100", className)}>
      {children}
    </div>
  );
}
