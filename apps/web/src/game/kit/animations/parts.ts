import type { LayerPart, Vec2 } from "../layer";

export interface PopPart extends LayerPart {
  type: "pop";
  scale?: number;
  duration?: number;
}

export interface ShakePart extends LayerPart {
  type: "shake";
  amplitude?: number;
  shakes?: number;
  duration?: number;
}

export interface BouncePart extends LayerPart {
  type: "bounce";
  travelSpeed?: number;
  bounceAmplitude?: number;
  bounceDuration?: number;
  target: Vec2;
}

export interface SlidePart extends LayerPart {
  type: "slide";
  speed?: number;
  target: Vec2;
}
