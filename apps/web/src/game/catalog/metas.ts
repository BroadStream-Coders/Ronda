import type { GameMeta } from "@/game/kit";

import { meta as calculoMental } from "./calculo-mental/meta";
import { meta as deletreo } from "./deletreo/meta";
import { meta as armaLaOracion } from "./arma-la-oracion/meta";
import { meta as armaLaPalabra } from "./arma-la-palabra/meta";
import { meta as laSabesONo } from "./la-sabes-o-no/meta";
import { meta as miLibroFavorito } from "./mi-libro-favorito/meta";
import { meta as intruso } from "./intruso/meta";
import { meta as alVuelo } from "./al-vuelo/meta";

export const metas: Record<string, GameMeta> = {
  [deletreo.id]: deletreo,
  [calculoMental.id]: calculoMental,
  [laSabesONo.id]: laSabesONo,
  [miLibroFavorito.id]: miLibroFavorito,
  [intruso.id]: intruso,
  [alVuelo.id]: alVuelo,
  [armaLaOracion.id]: armaLaOracion,
  [armaLaPalabra.id]: armaLaPalabra,
};
