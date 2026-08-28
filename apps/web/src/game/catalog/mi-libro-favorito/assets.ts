const BASE = "/programs/que-gane-el-mejor/games/mi-libro-favorito";

export const HEARTS = {
  full: `${BASE}/full-heart.png`,
  broken: `${BASE}/broken-heart.png`,
} as const;

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
} as const;

export const PRELOAD = [
  `${BASE}/main-frame.png`,
  `${BASE}/name-frame.png`,
  HEARTS.full,
  HEARTS.broken,
  SOUNDS.correct,
  SOUNDS.incorrect,
];
