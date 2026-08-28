const BASE = "/programs/que-gane-el-mejor/games/la-sabes-o-no";

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
} as const;

export const PRELOAD = [
  `${BASE}/mask.png`,
  `${BASE}/border.png`,
  `${BASE}/question-frame.png`,
  `${BASE}/book-left.png`,
  `${BASE}/book-right.png`,
  `${BASE}/normal-frame.png`,
  `${BASE}/correct-frame.png`,
  `${BASE}/incorrect-frame.png`,
  SOUNDS.correct,
  SOUNDS.incorrect,
];
