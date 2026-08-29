const BASE = "/programs/que-gane-el-mejor/games/album";

const COLORS = ["red", "yellow", "blue", "orange", "green", "purple"] as const;

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
} as const;

export const CARD_CROMA = `${BASE}/cards/croma.png`;

export const CARD_COLORS = COLORS.map((color) => `${BASE}/cards/${color}.png`);

export const THEMES = COLORS.map((color) => `${BASE}/themes/${color}.png`);

export const PRELOAD = [
  `${BASE}/logo.png`,
  `${BASE}/mask.png`,
  CARD_CROMA,
  ...CARD_COLORS,
  ...THEMES,
  "/programs/que-gane-el-mejor/shared/video/background-blue.mp4",
  SOUNDS.correct,
  SOUNDS.incorrect,
];
