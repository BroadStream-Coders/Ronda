import type { LayerPart } from "../layer";

export interface GlintPart extends LayerPart {
  type: "glint";
  duration?: number;
  intensity?: number;
}

export function GlintView({ part }: { part: GlintPart }) {
  const duration = part.duration ?? 0.7;
  const intensity = part.intensity ?? 0.6;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`@keyframes ronda-glint {
  from { transform: translateX(0) rotate(8deg); }
  to { transform: translateX(400%) rotate(8deg); }
}`}</style>
      <div
        className="absolute"
        style={{
          top: "-60%",
          left: "-120%",
          width: "70%",
          height: "220%",
          background: `linear-gradient(100deg, transparent 35%, rgba(255, 255, 255, ${intensity}) 50%, transparent 65%)`,
          animation: `ronda-glint ${duration}s ease-in-out both`,
        }}
      />
    </div>
  );
}
