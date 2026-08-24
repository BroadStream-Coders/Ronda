const BASE = "/programs/que-gane-el-mejor/games/calculo-mental";

export const FRAMES = {
  blue: `${BASE}/blue-frame.png`,
  purple: `${BASE}/purple-frame.png`,
  check: `${BASE}/check.png`,
  x: `${BASE}/x.png`,
};

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
};

export const PRELOAD = [
  FRAMES.blue,
  FRAMES.purple,
  FRAMES.check,
  FRAMES.x,
  SOUNDS.correct,
  SOUNDS.incorrect,
];
