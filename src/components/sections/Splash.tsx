import Image from "next/image";

/** Loading screen using the official logo artwork unmodified. Pure CSS fade-out: can't get stuck without JS. */
export function Splash() {
  return (
    <div className="splash fixed inset-0 z-[200] grid place-items-center bg-navy-950" aria-hidden>
      <Image src="/kvesty-logo.png" alt="" width={540} height={360} priority unoptimized className="splash-logo h-auto w-[min(78vw,540px)]" />
    </div>
  );
}
