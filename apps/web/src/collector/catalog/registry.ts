import type { ComponentType, ElementType } from "react";

import { deletreo } from "./deletreo";
import { calculoMental } from "./calculo-mental";
import { siONo } from "./si-o-no";
import { laSabesONo } from "./la-sabes-o-no";
import { miLibroFavorito } from "./mi-libro-favorito";
import { buscaLogo } from "./busca-logo";
import { album } from "./album";
import { cronos } from "./cronos";
import { operacionesCombinadas } from "./operaciones-combinadas";
import { deParEnPar } from "./de-par-en-par";
import { retoCruzado } from "./reto-cruzado";
import { intruso } from "./intruso";
import { galeriaFotos } from "./galeria-fotos";
import { tresEnRaya } from "./tres-en-raya";
import { armaLaPalabra } from "./arma-la-palabra";
import { armaLaOracion } from "./arma-la-oracion";

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
  [album.meta.id]: album,
  [cronos.meta.id]: cronos,
  [operacionesCombinadas.meta.id]: operacionesCombinadas,
  [deParEnPar.meta.id]: deParEnPar,
  [retoCruzado.meta.id]: retoCruzado,
  [intruso.meta.id]: intruso,
  [galeriaFotos.meta.id]: galeriaFotos,
  [tresEnRaya.meta.id]: tresEnRaya,
  [armaLaPalabra.meta.id]: armaLaPalabra,
  [armaLaOracion.meta.id]: armaLaOracion,
};
