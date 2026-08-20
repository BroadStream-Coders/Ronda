export const FRAMES = {
  normal: "/games/deletreo/main-frame.png",
  error: "/games/deletreo/error-frame.png",
} as const;

export const SOUNDS = {
  correct: "/games/shared/correct.mp3",
  incorrect: "/games/shared/incorrect.mp3",
} as const;

export const PRELOAD = [
  FRAMES.normal,
  FRAMES.error,
  SOUNDS.correct,
  SOUNDS.incorrect,
];
