const BASE = "/programs/que-gane-el-mejor/games/intruso";

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
} as const;

export const PRELOAD = [
  `${BASE}/main-frame.png`,
  `${BASE}/mask.png`,
  `${BASE}/normal-frame.png`,
  `${BASE}/correct-frame.png`,
  `${BASE}/incorrect-frame.png`,
  `${BASE}/color/red.png`,
  `${BASE}/color/blue.png`,
  `${BASE}/color/green.png`,
  `${BASE}/color/yellow.png`,
  "/programs/que-gane-el-mejor/shared/video/background-blue.mp4",
  SOUNDS.correct,
  SOUNDS.incorrect,
];
