const BASE = "/programs/que-gane-el-mejor/games/reto-cruzado";
const L0 = `${BASE}/level-0`;
const L12 = `${BASE}/level-1-2`;
const L3 = `${BASE}/level-3`;
const L4 = `${BASE}/level-4`;

export const SOUNDS = {
  correct: "/programs/que-gane-el-mejor/shared/audio/correct.mp3",
  incorrect: "/programs/que-gane-el-mejor/shared/audio/incorrect.mp3",
} as const;

const sides = (base: string) =>
  ["left", "right"].flatMap((side) => [
    `${base}/${side}-frame.png`,
    `${base}/${side}-frame-correct.png`,
    `${base}/${side}-frame-incorrect.png`,
  ]);

export const PRELOAD = [
  `${L0}/title.png`,
  `${L0}/frame-blue.png`,
  `${L0}/frame-purple.png`,
  `${L12}/main-frame.png`,
  ...sides(L12),
  ...["red", "green", "yellow", "blue"].map((c) => `${L12}/colors/${c}.png`),
  ...sides(L3),
  ...["1", "2", "3", "a", "b", "c"].map((i) => `${L3}/index/${i}.png`),
  ...["normal", "correct", "error"].map((l) => `${L3}/line/${l}.png`),
  `${L4}/main-frame.png`,
  `${L4}/answer-frame.png`,
  "/programs/que-gane-el-mejor/shared/video/background-blue.mp4",
  SOUNDS.correct,
  SOUNDS.incorrect,
];
