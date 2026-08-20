import type { GameMeta } from "@/game/kit";

import { meta as deletreo } from "./deletreo/meta";

export const metas: Record<string, GameMeta> = {
  [deletreo.id]: deletreo,
};
