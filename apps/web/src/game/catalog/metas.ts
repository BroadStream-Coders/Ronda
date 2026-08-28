import type { GameMeta } from "@/game/kit";

import { meta as calculoMental } from "./calculo-mental/meta";
import { meta as deletreo } from "./deletreo/meta";
import { meta as armaLaOracion } from "./arma-la-oracion/meta";
import { meta as armaLaPalabra } from "./arma-la-palabra/meta";
import { meta as laSabesONo } from "./la-sabes-o-no/meta";

export const metas: Record<string, GameMeta> = {
  [deletreo.id]: deletreo,
  [calculoMental.id]: calculoMental,
  [laSabesONo.id]: laSabesONo,
  [armaLaOracion.id]: armaLaOracion,
  [armaLaPalabra.id]: armaLaPalabra,
};
