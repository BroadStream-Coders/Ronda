import type { GameMeta } from "@/game/kit";

import { meta as calculoMental } from "./calculo-mental/meta";
import { meta as deletreo } from "./deletreo/meta";
import { meta as armaLaOracion } from "./arma-la-oracion/meta";
import { meta as armaLaPalabra } from "./arma-la-palabra/meta";
import { meta as laSabesONo } from "./la-sabes-o-no/meta";
import { meta as miLibroFavorito } from "./mi-libro-favorito/meta";
import { meta as intruso } from "./intruso/meta";
import { meta as alVuelo } from "./al-vuelo/meta";
import { meta as album } from "./album/meta";
import { meta as cronos } from "./cronos/meta";
import { meta as tresEnRaya } from "./tres-en-raya/meta";
import { meta as galeriaFotos } from "./galeria-fotos/meta";
import { meta as retoCruzado } from "./reto-cruzado/meta";
import { meta as buscaLogo } from "./busca-logo/meta";
import { meta as deParEnPar } from "./de-par-en-par/meta";

export const metas: Record<string, GameMeta> = {
  [deletreo.id]: deletreo,
  [calculoMental.id]: calculoMental,
  [laSabesONo.id]: laSabesONo,
  [miLibroFavorito.id]: miLibroFavorito,
  [intruso.id]: intruso,
  [alVuelo.id]: alVuelo,
  [armaLaOracion.id]: armaLaOracion,
  [armaLaPalabra.id]: armaLaPalabra,
  [album.id]: album,
  [cronos.id]: cronos,
  [tresEnRaya.id]: tresEnRaya,
  [galeriaFotos.id]: galeriaFotos,
  [retoCruzado.id]: retoCruzado,
  [buscaLogo.id]: buscaLogo,
  [deParEnPar.id]: deParEnPar,
};
