const BASE = "/programs/que-gane-el-mejor/games/tres-en-raya";

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
} as const;

export const NUMBERS = Array.from(
  { length: 9 },
  (_, index) => `${BASE}/numbers/${index + 1}.png`,
);

export const PRELOAD = [
  `${BASE}/grid.png`,
  `${BASE}/card.png`,
  `${BASE}/circle.png`,
  `${BASE}/cross.png`,
  `${BASE}/lines/row.png`,
  `${BASE}/lines/column.png`,
  `${BASE}/lines/diagonal.png`,
  ...NUMBERS,
  "/programs/que-gane-el-mejor/shared/video/background-blue.mp4",
  SOUNDS.correct,
  SOUNDS.incorrect,
];
