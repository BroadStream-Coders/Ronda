const BASE = "/programs/que-gane-el-mejor/games/album";

const COLORS = ["red", "yellow", "blue", "orange", "green", "purple"] as const;

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
} as const;

export const CARDS = {
  croma: `${BASE}/cards/croma.png`,
  ...Object.fromEntries(COLORS.map((c) => [c, `${BASE}/cards/${c}.png`])),
} as Record<"croma" | (typeof COLORS)[number], string>;

export const THEMES = COLORS.map((c) => `${BASE}/themes/${c}.png`);

export const PRELOAD = [
  `${BASE}/logo.png`,
  `${BASE}/mask.png`,
  ...Object.values(CARDS),
  ...THEMES,
  "/programs/que-gane-el-mejor/shared/video/background-blue.mp4",
  SOUNDS.correct,
  SOUNDS.incorrect,
];
