"use client";

import { useEffect, useState } from "react";

import {
  playSound,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import { correctOption, type AlVueloSession } from "./session";

const QUESTION_ID = "question-text";
const OPTION_COUNT = 2;
const MARKS = ["normal", "correct", "incorrect"] as const;

type Mark = (typeof MARKS)[number];

const frameId = (option: number, mark: Mark) => `option-${option}-frame-${mark}`;

interface Cursor {
  loadedAt: number;
  group: number;
  question: number;
  selected: number;
  marks: Mark[];
}

const CLEAN = {
  selected: -1,
  marks: ["normal", "normal"] as Mark[],
};

const START: Cursor = { loadedAt: 0, group: 0, question: 0, ...CLEAN };

export function AlVueloLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const session = useGameSession((s) => s.session) as AlVueloSession | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);

  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const groups = session?.groups ?? [];
  const questions = groups[cursor.group]?.questions ?? [];
  const question = questions[cursor.question];

  const correctIndex = question ? correctOption(question) : -1;

  const text = question?.question ?? "";
  useEffect(() => {
    patch(QUESTION_ID, "text", { text });
  }, [text, patch]);

  const marks = cursor.marks;
  useEffect(() => {
    for (let option = 0; option < OPTION_COUNT; option++) {
      for (const mark of MARKS) {
        setVisible(frameId(option, mark), marks[option] === mark);
      }
    }
  }, [marks, setVisible]);

  const goTo = (next: Partial<Cursor>) =>
    setCursor((c) => ({ ...c, ...next, ...CLEAN }));

  const mark = (option: number, value: Mark) =>
    setCursor((c) => ({
      ...c,
      selected: option,
      marks: c.marks.map((current, i) => (i === option ? value : current)),
    }));

  const judge = (option: number) => {
    if (!question || option < 0 || option >= OPTION_COUNT) return;
    if (correctIndex < 0) return;
    const correct = option === correctIndex;
    mark(option, correct ? "correct" : "incorrect");
    playSound(correct ? SOUNDS.correct : SOUNDS.incorrect);
  };

  useGameKeys({
    onNumber: (value) => {
      if (value >= 0 && value < questions.length) goTo({ question: value });
    },
    onNavigate: (value) => {
      if (value >= 0 && value < groups.length) goTo({ group: value, question: 0 });
    },
    onNext: () => {
      if (cursor.question < questions.length - 1)
        goTo({ question: cursor.question + 1 });
    },
    onBack: () => {
      if (cursor.question > 0) goTo({ question: cursor.question - 1 });
    },
    onOption: (index) => {
      if (!question || index >= OPTION_COUNT) return;
      setCursor((c) => ({ ...c, selected: index }));
    },
    onValidate: () => judge(cursor.selected),
    onArrowLeft: () => judge(0),
    onArrowRight: () => judge(1),
    onShowAnswer: () => {
      if (!question || correctIndex < 0) return;
      mark(correctIndex, "correct");
      playSound(SOUNDS.correct);
    },
  });

  return null;
}
