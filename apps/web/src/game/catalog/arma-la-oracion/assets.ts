export const SOUNDS = {
  correct: "/games/shared/correct.mp3",
  incorrect: "/games/shared/incorrect.mp3",
} as const;

export const PRELOAD = [SOUNDS.correct, SOUNDS.incorrect];
