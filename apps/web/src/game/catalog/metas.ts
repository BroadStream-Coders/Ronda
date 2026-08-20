import type { GameMeta } from "@/game/kit";

import { meta as calculoMental } from "./calculo-mental/meta";
import { meta as deletreo } from "./deletreo/meta";

export const metas: Record<string, GameMeta> = {
  [deletreo.id]: deletreo,
  [calculoMental.id]: calculoMental,
};
