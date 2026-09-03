const LEVEL_2 = "/programs/que-gane-el-mejor/games/busca-logo/level-2";

export const EMPTY_FACES = {
  normal: `${LEVEL_2}/empty.png`,
  variant: `${LEVEL_2}/empty-variant.png`,
} as const;

export const PRELOAD = [EMPTY_FACES.normal, EMPTY_FACES.variant];
