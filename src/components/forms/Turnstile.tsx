"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void; remove: (id: string) => void };
    __tsReady?: Promise<void>;
  }
}
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript() {
  if (window.__tsReady) return window.__tsReady;
  window.__tsReady = new Promise<void>((res, rej) => {
    const s = document.createElement("script");
    s.src = SRC; s.async = true; s.defer = true;
    s.onload = () => res(); s.onerror = () => rej(new Error("turnstile"));
    document.head.appendChild(s);
  });
  return window.__tsReady;
}

/** Cloudflare Turnstile. `resetKey` increments to force a fresh challenge (tokens are single-use). */
export function Turnstile({ onToken, resetKey = 0 }: { onToken: (t: string | null) => void; resetKey?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !box.current) return;
    let dead = false;
    loadScript().then(() => {
      if (dead || !box.current || !window.turnstile) return;
      id.current = window.turnstile.render(box.current, {
        sitekey: siteKey, theme: "dark", appearance: "always",
        callback: (t: string) => onToken(t),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    }).catch(() => onToken(null));
    return () => { dead = true; if (id.current && window.turnstile) window.turnstile.remove(id.current); id.current = null; };
  }, [siteKey, onToken]);

  useEffect(() => { if (resetKey && id.current && window.turnstile) { onToken(null); window.turnstile.reset(id.current); } }, [resetKey, onToken]);

  if (!siteKey) {
    return <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">Human verification is not configured (NEXT_PUBLIC_TURNSTILE_SITE_KEY). {process.env.NODE_ENV === "production" ? "Submissions will be refused until it is set." : "Skipped in development."}</p>;
  }
  return <div ref={box} className="min-h-[65px]" />;
}
