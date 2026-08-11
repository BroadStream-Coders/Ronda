import type { ComponentType, ElementType } from "react";

import { deletreo } from "./deletreo";

export interface CollectorMeta {
  id: string;
  name: string;
  icon: ElementType;
}

export interface CollectorType {
  meta: CollectorMeta;
  Editor: ComponentType;
}

export const registry: Record<string, CollectorType> = {
  [deletreo.meta.id]: deletreo,
};
