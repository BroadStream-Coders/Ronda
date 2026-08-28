const BASE = "/programs/que-gane-el-mejor/games/al-vuelo";

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
} as const;

export const PRELOAD = [
  `${BASE}/main-banner.png`,
  `${BASE}/answer-banner.png`,
  `${BASE}/correct-frame.png`,
  `${BASE}/incorrect-frame.png`,
  `${BASE}/selection.png`,
  SOUNDS.correct,
  SOUNDS.incorrect,
];
