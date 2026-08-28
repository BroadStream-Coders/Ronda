"use client";

import { useEffect, useState } from "react";

import {
  playSound,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import type { LaSabesSession } from "./session";

const QUESTION_ID = "question-text";
const OPTION_COUNT = 2;
const MARKS = ["normal", "correct", "incorrect"] as const;

type Mark = (typeof MARKS)[number];

const frameId = (option: number, mark: Mark) => `option-${option}-frame-${mark}`;
const textId = (option: number, mark: Mark) => `option-${option}-text-${mark}`;

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

export function LaSabesLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const session = useGameSession((s) => s.session) as LaSabesSession | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);

  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const groups = session?.groups ?? [];
  const questions = groups[cursor.group]?.questions ?? [];
  const question = questions[cursor.question];

  useEffect(() => {
    patch(QUESTION_ID, "text", { text: question?.question ?? "" });
    for (let option = 0; option < OPTION_COUNT; option++) {
      const text = question?.options[option] ?? "";
      for (const mark of MARKS) patch(textId(option, mark), "text", { text });
    }
  }, [question, patch]);

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
      marks: c.marks.map((current, i) => (i === option ? value : current)),
    }));

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
    onValidate: () => {
      if (!question || cursor.selected < 0) return;
      const correct = cursor.selected === question.correctIndex;
      mark(cursor.selected, correct ? "correct" : "incorrect");
      playSound(correct ? SOUNDS.correct : SOUNDS.incorrect);
    },
    onShowAnswer: () => {
      if (!question) return;
      mark(question.correctIndex, "correct");
      playSound(SOUNDS.correct);
    },
  });

  return null;
}
