import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * The official KVESTY logo, used unmodified (files in /public/brand are straight crops of the supplied artwork;
 * no recolouring, redrawing or distortion). Aspect ratios are fixed via width/height.
 */
const V = {
  nav: { src: "/brand/kvesty-logo-lockup-notagline.png", w: 970, h: 295 },
  full: { src: "/brand/kvesty-logo-lockup.png", w: 970, h: 350 },
  mark: { src: "/brand/kvesty-mark.png", w: 320, h: 280 },
} as const;

export function Logo({ variant = "nav", height = 44, href = "/", className, priority }: { variant?: keyof typeof V; height?: number; href?: string | null; className?: string; priority?: boolean }) {
  const v = V[variant];
  const width = Math.round((v.w / v.h) * height);
  const img = <Image src={v.src} alt="KVESTY — Invest. Trade. Grow." width={width} height={height} priority={priority} unoptimized style={{ height, width }} className={cn("select-none rounded-lg object-contain ring-1 ring-white/10", className)} />;
  return href ? <Link href={href} aria-label="KVESTY home" className="inline-block shrink-0">{img}</Link> : img;
}
