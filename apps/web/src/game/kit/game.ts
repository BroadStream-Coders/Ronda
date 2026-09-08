import type { ComponentType, ElementType } from "react";

import type { Layer } from "./layer";
import type { FontRegistry } from "./font-context";
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
  images?: boolean;
  pointer?: boolean;
  chromaLayerId?: string;
  timerLayerId?: string;
  preload?: string[];
  parts?: PartRegistry;
  fonts?: FontRegistry;
  logic?: ComponentType<{ programId: string }>;
  load: (file: File) => Promise<void>;
}
