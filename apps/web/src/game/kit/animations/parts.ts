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

export interface BlinkPart extends LayerPart {
  type: "blink";
  pulseScale?: number;
  pulseDuration?: number;
  blinkCount?: number;
  blinkDuration?: number;
}

export interface FlipPart extends LayerPart {
  type: "flip";
  hideDuration?: number;
  showDuration?: number;
  perspective?: number;
}

export interface FloatPart extends LayerPart {
  type: "float";
  amplitude?: number;
  rotation?: number;
  period?: number;
  phase?: number;
}

export interface SparklesPart extends LayerPart {
  type: "sparkles";
  enabled?: boolean;
  rate?: number;
  size?: number;
  duration?: number;
}
