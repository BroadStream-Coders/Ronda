const BASE = "/programs/que-gane-el-mejor/games/cronos";

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
  countdown: "/programs/que-gane-el-mejor/shared/audio/countdown.mp3",
} as const;

export const COUNTDOWN_SECONDS = 5;

export const PRELOAD = [
  `${BASE}/lines.png`,
  `${BASE}/title-frame.png`,
  `${BASE}/drop-zone.png`,
  `${BASE}/background.png`,
  `${BASE}/mask.png`,
  `${BASE}/banner.png`,
  `${BASE}/letter.png`,
  `${BASE}/stopwatch.png`,
  `${BASE}/points/normal.png`,
  `${BASE}/points/correct.png`,
  `${BASE}/points/incorrect.png`,
  "/programs/que-gane-el-mejor/shared/video/background-blue.mp4",
  SOUNDS.correct,
  SOUNDS.incorrect,
  SOUNDS.countdown,
];
