import type { CSSProperties } from "react";

export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

export interface Vec2 {
  x: number;
  y: number;
}

export const DESIGN_SIZE: Vec2 = { x: DESIGN_WIDTH, y: DESIGN_HEIGHT };

export interface Rect {
  position: Vec2;
  size: Vec2;
  pivot: Vec2;
  rotation?: number;
}

export interface LayerPart {
  type: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  parentId?: string;
  rect: Rect;
  parts: LayerPart[];
}

export function layerStyle(rect: Rect, parentSize: Vec2): CSSProperties {
  const { position, size, pivot, rotation } = rect;
  return {
    left: `${(0.5 + position.x / parentSize.x - (pivot.x * size.x) / parentSize.x) * 100}%`,
    top: `${(0.5 - position.y / parentSize.y - (pivot.y * size.y) / parentSize.y) * 100}%`,
    width: `${(size.x / parentSize.x) * 100}%`,
    height: `${(size.y / parentSize.y) * 100}%`,
    transformOrigin: `${pivot.x * 100}% ${pivot.y * 100}%`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
  };
}

export function partOf<P extends LayerPart>(
  layer: Layer | undefined,
  type: P["type"],
): P | undefined {
  return layer?.parts.find((part) => part.type === type) as P | undefined;
}

export function findPart<P extends LayerPart>(
  layout: Layer[],
  layerId: string,
  type: P["type"],
): P | undefined {
  return partOf<P>(
    layout.find((candidate) => candidate.id === layerId),
    type,
  );
}
