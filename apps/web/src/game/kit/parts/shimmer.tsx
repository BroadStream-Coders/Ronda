import type { LayerPart } from "../layer";

export interface ShimmerPart extends LayerPart {
  type: "shimmer";
  period?: number;
  sweep?: number;
  phase?: number;
  intensity?: number;
  radius?: number;
}

export function ShimmerView({ part }: { part: ShimmerPart }) {
  const period = part.period ?? 5.5;
  const intensity = part.intensity ?? 0.55;
  if (period <= 0 || intensity <= 0) return null;

  const sweep = part.sweep && part.sweep > 0 ? part.sweep : 1;
  let outFraction = sweep / period;
  let backFraction = (sweep * 1.2) / period;
  const total = outFraction + backFraction;
  if (total > 1) {
    outFraction /= total;
    backFraction /= total;
  }
  const restEnd = Math.round((1 - outFraction - backFraction) * 1000) / 10;
  const outEnd = Math.round((restEnd + outFraction * 100) * 10) / 10;
  const name = `ronda-shimmer-${restEnd}-${outEnd}`.replace(/\./g, "_");

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      style={{ borderRadius: `${part.radius ?? 1}cqw` }}
    >
      <style>{`@keyframes ${name} {
  0%, ${restEnd}%, 100% { transform: translateX(0) rotate(8deg); }
  ${outEnd}% { transform: translateX(400%) rotate(8deg); }
}`}</style>
      <div
        className="absolute"
        style={{
          top: "-60%",
          left: "-120%",
          width: "70%",
          height: "220%",
          background: `linear-gradient(100deg, transparent 0%, transparent 35%, rgba(255, 255, 255, ${intensity}) 50%, transparent 65%, transparent 100%)`,
          animation: `${name} ${period}s ease-in-out infinite`,
          animationDelay: `${-(part.phase ?? 0)}s`,
        }}
      />
    </div>
  );
}
