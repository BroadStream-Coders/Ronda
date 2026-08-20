import type { ComponentType } from "react";

import type { LayerPart } from "./layer";

export type PartView = ComponentType<{ part: LayerPart }>;

export type PartRegistry = Record<string, PartView>;

export function partView<P extends LayerPart>(
  view: ComponentType<{ part: P }>,
): PartView {
  return view as PartView;
}
