import type { LayerPart } from "../layer";

export interface HoloPart extends LayerPart {
  type: "holo";
  enabled?: boolean;
  period?: number;
  intensity?: number;
  glow?: number;
  radius?: number;
}

export function HoloView({ part }: { part: HoloPart }) {
  if (!part.enabled) return null;

  const period = part.period && part.period > 0 ? part.period : 4;
  const intensity = part.intensity ?? 0.55;
  const glow = part.glow ?? 0.85;
  if (intensity <= 0 && glow <= 0) return null;

  const borderRadius = `${part.radius ?? 1}cqw`;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {glow > 0 && (
        <div
          className="absolute inset-0"
          style={{
            borderRadius,
            boxShadow: `0 0 3.5cqw 0.3cqw oklch(0.85 0.16 90 / ${glow})`,
            animation: `ronda-holo-pulse ${period * 0.56}s ease-in-out infinite`,
          }}
        />
      )}
      {intensity > 0 && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius }}
        >
          <div
            className="absolute"
            style={{
              top: "-60%",
              left: "-120%",
              width: "70%",
              height: "220%",
              mixBlendMode: "color-dodge",
              background: `linear-gradient(100deg, transparent 0%, oklch(0.9 0.16 95 / ${intensity}) 30%, oklch(0.92 0.14 150 / ${intensity * 0.55}) 42%, oklch(0.88 0.18 55 / ${intensity}) 55%, oklch(0.9 0.15 320 / ${intensity * 0.5}) 68%, transparent 100%)`,
              animation: `ronda-holo-sweep ${period}s ease-in-out infinite`,
            }}
          />
        </div>
      )}
    </div>
  );
}
