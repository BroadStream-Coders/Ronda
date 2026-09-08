import type { LayerPart } from "../layer";

export interface TimerPart extends LayerPart {
  type: "timer";
  duration: number;
}
