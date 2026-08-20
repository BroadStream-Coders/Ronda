import type { ComponentType, ElementType } from "react";

import type { Layer } from "./layer";
import type { PartRegistry } from "./registry";

export interface GameMeta {
  id: string;
  name: string;
  description?: string;
  icon: ElementType;
}

export interface GameType {
  meta: GameMeta;
  layout: Layer[];
  parts?: PartRegistry;
  logic?: ComponentType;
  load: (file: File) => Promise<void>;
}
