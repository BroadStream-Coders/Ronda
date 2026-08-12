import type { ComponentType, ElementType } from "react";

import { deletreo } from "./deletreo";
import { calculoMental } from "./calculo-mental";
import { siONo } from "./si-o-no";
import { laSabesONo } from "./la-sabes-o-no";
import { miLibroFavorito } from "./mi-libro-favorito";
import { buscaLogo } from "./busca-logo";

export interface CollectorMeta {
  id: string;
  name: string;
  description?: string;
  icon: ElementType;
}

export interface CollectorType {
  meta: CollectorMeta;
  Editor: ComponentType;
}

export const registry: Record<string, CollectorType> = {
  [deletreo.meta.id]: deletreo,
  [calculoMental.meta.id]: calculoMental,
  [siONo.meta.id]: siONo,
  [laSabesONo.meta.id]: laSabesONo,
  [miLibroFavorito.meta.id]: miLibroFavorito,
  [buscaLogo.meta.id]: buscaLogo,
};
