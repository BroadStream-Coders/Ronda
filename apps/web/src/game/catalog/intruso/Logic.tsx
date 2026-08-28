"use client";

import { useEffect, useState } from "react";

import {
  playSound,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import type { IntrusoSession } from "./session";

const PICTURE_ID = "picture";
const OPTION_COUNT = 4;
const MARKS = ["normal", "correct", "incorrect"] as const;

type Mark = (typeof MARKS)[number];

const frameId = (option: number, mark: Mark) => `option-${option}-frame-${mark}`;
const textId = (option: number) => `option-${option}-text`;

interface Cursor {
  loadedAt: number;
  round: number;
  selected: number;
  marks: Mark[];
}

const CLEAN = {
  selected: -1,
  marks: ["normal", "normal", "normal", "normal"] as Mark[],
};

const START: Cursor = { loadedAt: 0, round: 0, ...CLEAN };

export function IntrusoLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const session = useGameSession((s) => s.session) as IntrusoSession | null;
  const images = useGameSession((s) => s.images);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);

  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const rounds = session?.textRounds ?? [];
  const round = rounds[cursor.round];
  const picture = round ? (images[round.imagePath] ?? "") : "";

  useEffect(() => {
    patch(PICTURE_ID, "image", { src: picture });
    for (let option = 0; option < OPTION_COUNT; option++) {
      patch(textId(option), "text", { text: round?.choices[option] ?? "" });
    }
  }, [picture, round, patch]);

  const marks = cursor.marks;
  useEffect(() => {
    for (let option = 0; option < OPTION_COUNT; option++) {
      for (const mark of MARKS) {
        setVisible(frameId(option, mark), marks[option] === mark);
      }
    }
  }, [marks, setVisible]);

  const goTo = (index: number) => {
    if (index < 0 || index >= rounds.length) return;
    setCursor((c) => ({ ...c, round: index, ...CLEAN }));
  };

  const mark = (option: number, value: Mark) =>
    setCursor((c) => ({
      ...c,
      marks: c.marks.map((current, i) => (i === option ? value : current)),
    }));

  useGameKeys({
    onNumber: goTo,
    onNext: () => goTo(cursor.round + 1),
    onBack: () => goTo(cursor.round - 1),
    onOption: (index) => {
      if (!round || index >= OPTION_COUNT) return;
      setCursor((c) => ({ ...c, selected: index }));
    },
    onValidate: () => {
      if (!round || cursor.selected < 0) return;
      const correct = cursor.selected === round.answerIndex;
      mark(cursor.selected, correct ? "correct" : "incorrect");
      playSound(correct ? SOUNDS.correct : SOUNDS.incorrect);
    },
    onShowAnswer: () => {
      if (!round) return;
      mark(round.answerIndex, "correct");
      playSound(SOUNDS.correct);
    },
  });

  return null;
}
