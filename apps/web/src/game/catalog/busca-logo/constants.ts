const BASE = "/programs/que-gane-el-mejor/games/busca-logo";

export const LEVEL_0_ID = "level-0";
export const LEVEL_0_MESSAGE_ID = "level-0-message";

export interface LevelSpec {
  size: string;
  id: string;
  count: number;
  columns: number;
  cards: string[];
  backs: string[];
  fronts: string[];
  normals: string[];
  selecteds: string[];
  lockeds: string[];
  empties: string[];
  logos: string[];
}

function level(size: string, id: string): LevelSpec {
  const [columns, rows] = size.split("x").map(Number);
  const count = columns * rows;
  const ids = (suffix: string) =>
    Array.from({ length: count }, (_, index) => `${id}-card-${index}${suffix}`);
  return {
    size,
    id,
    count,
    columns,
    cards: ids(""),
    backs: ids("-back"),
    fronts: ids("-front"),
    normals: ids("-normal"),
    selecteds: ids("-selected"),
    lockeds: ids("-locked"),
    empties: ids("-empty"),
    logos: ids("-logo"),
  };
}

export const LEVELS: Record<string, LevelSpec> = {
  "4x3": level("4x3", "level-1"),
  "5x4": level("5x4", "level-2"),
  "6x5": level("6x5", "level-3"),
};

export const LEVEL_LIST = Object.values(LEVELS);
export const BOARD_SIZES = Object.keys(LEVELS);

export const FALLBACK_LEVEL = LEVELS["5x4"];
export const MAX_CARDS = Math.max(...LEVEL_LIST.map((spec) => spec.count));

export interface EmptyFaces {
  normal: string;
  variant: string;
}

export const EMPTY_FACES: Record<string, EmptyFaces> = Object.fromEntries(
  LEVEL_LIST.map((spec) => [
    spec.id,
    {
      normal: `${BASE}/${spec.id}/empty.png`,
      variant: `${BASE}/${spec.id}/empty-variant.png`,
    },
  ]),
);

export const PRELOAD = Object.values(EMPTY_FACES).flatMap((faces) => [
  faces.normal,
  faces.variant,
]);
