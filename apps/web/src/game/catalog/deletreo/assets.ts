export const FRAMES = {
  normal: "/programs/que-gane-el-mejor/games/deletreo/main-frame.png",
  error: "/programs/que-gane-el-mejor/games/deletreo/error-frame.png",
} as const;

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
} as const;

export const PRELOAD = [
  FRAMES.normal,
  FRAMES.error,
  SOUNDS.correct,
  SOUNDS.incorrect,
];
