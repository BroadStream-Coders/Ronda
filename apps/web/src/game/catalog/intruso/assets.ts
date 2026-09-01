const BASE = "/programs/que-gane-el-mejor/games/intruso";
const LEVEL_1 = `${BASE}/level-1`;
const LEVEL_2 = `${BASE}/level-2`;

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
} as const;

export const COLORS = ["red", "blue", "green", "yellow"].map(
  (color) => `${BASE}/color/${color}.png`,
);

export const PRELOAD = [
  `${LEVEL_1}/main-frame.png`,
  `${LEVEL_1}/mask.png`,
  `${LEVEL_1}/normal-frame.png`,
  `${LEVEL_1}/correct-frame.png`,
  `${LEVEL_1}/incorrect-frame.png`,
  `${LEVEL_2}/picture-frame.png`,
  `${LEVEL_2}/mask.png`,
  `${LEVEL_2}/normal-frame.png`,
  `${LEVEL_2}/correct-frame.png`,
  `${LEVEL_2}/incorrect-frame.png`,
  ...COLORS,
  "/programs/que-gane-el-mejor/shared/video/background-blue.mp4",
  SOUNDS.correct,
  SOUNDS.incorrect,
];
