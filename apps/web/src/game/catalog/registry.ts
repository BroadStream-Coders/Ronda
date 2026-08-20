import type { GameType } from "@/game/kit";

import { deletreo } from "./deletreo";

export const registry: Record<string, GameType> = {
  [deletreo.meta.id]: deletreo,
};
