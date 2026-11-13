/**
 * Decorative hero graphic: an abstract dot-matrix globe, orbital rings and ascending candlesticks.
 * Purely illustrative — no data, no prices. Geometry is deterministic (no Math.random) so SSR/CSR match.
 */
const R = 210, CX = 300, CY = 300, TILT = (-18 * Math.PI) / 180, ROT = (-25 * Math.PI) / 180;

function dots() {
  const out: { x: number; y: number; o: number; r: number }[] = [];
  for (let lat = -80; lat <= 80; lat += 6) {
    const phi = (lat * Math.PI) / 180;
    const step = Math.max(6, 6 / Math.max(Math.cos(phi), 0.25));
    for (let lon = -180; lon < 180; lon += step) {
      const th = (lon * Math.PI) / 180 + ROT;
      let x = Math.cos(phi) * Math.sin(th), y = Math.sin(phi), z = Math.cos(phi) * Math.cos(th);
      const y2 = y * Math.cos(TILT) - z * Math.sin(TILT), z2 = y * Math.sin(TILT) + z * Math.cos(TILT);
      y = y2; z = z2;
      if (z < 0.02) continue;
      out.push({ x: +(CX + x * R).toFixed(1), y: +(CY - y * R).toFixed(1), o: +(0.18 + z * 0.72).toFixed(2), r: +(0.9 + z * 1.5).toFixed(2) });
    }
  }
  return out;
}
const D = dots();
const candles = [
  [18, 30, 10], [34, 44, 8], [28, 52, 10], [46, 66, 9], [40, 70, 12], [58, 84, 10], [52, 92, 11], [70, 108, 10], [64, 116, 12], [84, 132, 10],
] as const; // [body, wickTop, wickBottom] offsets — abstract shapes only

export function GlobeVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" role="img" aria-label="Abstract illustration of a digital globe with orbital rings and rising market bars" className={className}>
      <defs>
        <radialGradient id="g-sphere" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#2f7bff" stopOpacity=".35" />
          <stop offset="55%" stopColor="#10286e" stopOpacity=".35" />
          <stop offset="100%" stopColor="#030818" stopOpacity=".9" />
        </radialGradient>
        <linearGradient id="g-ring" x1="0" x2="1">
          <stop offset="0" stopColor="#2f7bff" stopOpacity="0" />
          <stop offset=".5" stopColor="#8bb8ff" stopOpacity=".9" />
          <stop offset="1" stopColor="#2f7bff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="g-candle" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1d4ed8" stopOpacity=".15" />
          <stop offset="1" stopColor="#5b9bff" stopOpacity=".85" />
        </linearGradient>
        <filter id="g-blur"><feGaussianBlur stdDeviation="22" /></filter>
      </defs>
      <circle cx={CX} cy={CY} r={R + 40} fill="#2f7bff" opacity=".18" filter="url(#g-blur)" />
      <circle cx={CX} cy={CY} r={R} fill="url(#g-sphere)" stroke="#5b9bff" strokeOpacity=".25" />
      <g fill="#8bb8ff">{D.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />)}</g>
      <g fill="none" strokeWidth="1.5">
        <ellipse cx={CX} cy={CY} rx="285" ry="88" transform="rotate(-24 300 300)" stroke="url(#g-ring)" />
        <ellipse cx={CX} cy={CY} rx="262" ry="64" transform="rotate(-24 300 300)" stroke="#5b9bff" strokeOpacity=".18" />
        <ellipse cx={CX} cy={CY} rx="250" ry="120" transform="rotate(32 300 300)" stroke="#2f7bff" strokeOpacity=".22" strokeDasharray="2 7" />
      </g>
      <g transform="rotate(-24 300 300)"><circle r="4" fill="#fff"><animateMotion dur="16s" repeatCount="indefinite" path="M 15 300 A 285 88 0 1 1 585 300 A 285 88 0 1 1 15 300" /></circle></g>
      <g transform="translate(405 470)" aria-hidden>
        {candles.map(([b, t, bt], i) => (
          <g key={i} transform={`translate(${i * 17} ${-i * 9})`}>
            <line x1="5" x2="5" y1={-t} y2={bt} stroke="#8bb8ff" strokeOpacity=".5" />
            <rect x="0" y={-b} width="10" height={b * 0.9} rx="1.5" fill="url(#g-candle)" stroke="#5b9bff" strokeOpacity=".5" />
          </g>
        ))}
      </g>
    </svg>
  );
}
