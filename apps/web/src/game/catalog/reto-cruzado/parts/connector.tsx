"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion";

import { DESIGN_WIDTH, resolveMedia, type LayerPart } from "@/game/kit";

const BASE = "/programs/que-gane-el-mejor/games/reto-cruzado/level-3/line";

const LINES = {
  normal: `${BASE}/normal.png`,
  correct: `${BASE}/correct.png`,
  error: `${BASE}/error.png`,
} as const;

export type ConnectorState = keyof typeof LINES;

export interface ConnectorPart extends LayerPart {
  type: "connector";
  from?: string;
  to?: string;
  state?: ConnectorState;
  thickness?: number;
  duration?: number;
}

const unit = (value: number) => `${(value * 100) / DESIGN_WIDTH}cqw`;

export function ConnectorView({ part }: { part: ConnectorPart }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const { from, to, thickness = 15, duration = 0.5 } = part;
  const state = part.state ?? "normal";

  useEffect(() => {
    const box = boxRef.current;
    const line = lineRef.current;
    if (!box || !line || !from || !to) return;

    const bounds = box.getBoundingClientRect();
    if (bounds.width === 0) return;
    const scale = bounds.width / DESIGN_WIDTH;

    const centerOf = (layerId: string) => {
      const element = document.querySelector<HTMLElement>(
        `[data-layer-id="${layerId}"]`,
      );
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: (rect.left + rect.width / 2 - bounds.left) / scale,
        y: (rect.top + rect.height / 2 - bounds.top) / scale,
      };
    };

    const origin = centerOf(from);
    const target = centerOf(to);
    if (!origin || !target) return;

    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const length = Math.hypot(dx, dy);
    if (length < 1) return;

    line.style.left = unit(origin.x - thickness / 2);
    line.style.top = unit(origin.y);
    line.style.width = unit(thickness);
    line.style.transform = `rotate(${(Math.atan2(-dx, dy) * 180) / Math.PI}deg)`;

    const controls = animate(
      line,
      { height: [unit(0), unit(length)] },
      { duration, ease: "linear" },
    );
    return () => controls.stop();
  }, [from, to, thickness, duration]);

  if (!from || !to) return null;

  return (
    <div ref={boxRef} className="pointer-events-none absolute inset-0 z-10">
      <div
        ref={lineRef}
        className="absolute"
        style={{
          height: 0,
          transformOrigin: "50% 0",
          backgroundImage: `url("${resolveMedia(LINES[state])}")`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
