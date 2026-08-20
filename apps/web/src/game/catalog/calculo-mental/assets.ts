const BASE = "/games/calculo-mental";

export const FRAMES = {
  blue: `${BASE}/blue-frame.png`,
  purple: `${BASE}/purple-frame.png`,
  check: `${BASE}/check.png`,
  x: `${BASE}/x.png`,
};

export const SOUNDS = {
  correct: "/games/shared/correct.mp3",
  incorrect: "/games/shared/incorrect.mp3",
};

export const PRELOAD = [
  FRAMES.blue,
  FRAMES.purple,
  FRAMES.check,
  FRAMES.x,
  SOUNDS.correct,
  SOUNDS.incorrect,
];
