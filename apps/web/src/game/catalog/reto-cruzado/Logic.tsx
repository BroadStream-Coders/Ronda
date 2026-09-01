"use client";

import { useEffect, useState } from "react";

import {
  playSound,
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import type {
  RetoChoiceQuestion,
  RetoCruzadoSession,
  RetoGroup,
} from "./session";

const COURSE_SLOTS = 20;
const COURSES_PER_ROW = 4;
const COURSE = { width: 438, height: 142, gap: 12 };
const COURSES_BOX = { width: 1880, height: 850 };

const MARKS = ["normal", "correct", "incorrect"] as const;
type Mark = (typeof MARKS)[number];
type Level = 0 | 1 | 2 | 3 | 4;

const LEVELS: Level[] = [0, 1, 2, 3, 4];
const SLOTS = Array.from({ length: COURSE_SLOTS }, (_, index) => index);

const levelId = (level: Level) => `level-${level}`;
const courseId = (i: number) => `course-${i}`;
const courseTextId = (i: number) => `course-${i}-text`;
const courseFrameId = (i: number) => `course-${i}-frame`;
const courseLockedId = (i: number) => `course-${i}-frame-locked`;
const questionId = (level: 1 | 2) => `level-${level}-question`;
const optionId = (level: 1 | 2, i: number) => `level-${level}-option-${i}`;
const optionTextId = (level: 1 | 2, i: number) => `${optionId(level, i)}-text`;
const optionMarkId = (level: 1 | 2, i: number, mark: Mark) =>
  mark === "normal"
    ? `${optionId(level, i)}-frame`
    : `${optionId(level, i)}-frame-${mark}`;

const OPTION_COUNT: Record<1 | 2, number> = { 1: 2, 2: 4 };

function coursePosition(index: number, total: number) {
  const rows = Math.ceil(total / COURSES_PER_ROW);
  const row = Math.floor(index / COURSES_PER_ROW);
  const column = index % COURSES_PER_ROW;
  const inRow = Math.min(COURSES_PER_ROW, total - row * COURSES_PER_ROW);

  const rowWidth = inRow * COURSE.width + (inRow - 1) * COURSE.gap;
  const left = (COURSES_BOX.width - rowWidth) / 2;
  const x =
    left + column * (COURSE.width + COURSE.gap) + COURSE.width / 2 -
    COURSES_BOX.width / 2;

  const totalHeight = rows * COURSE.height + (rows - 1) * COURSE.gap;
  const top = (COURSES_BOX.height - totalHeight) / 2;
  const down = top + row * (COURSE.height + COURSE.gap) + COURSE.height / 2;

  return { x, y: COURSES_BOX.height / 2 - down };
}

interface ChoiceState {
  group: number;
  question: number;
  selected: number;
  marks: Mark[];
}

interface QaState {
  group: number;
  question: number;
  revealed: boolean;
}

const CHOICE_START: ChoiceState = {
  group: 0,
  question: 0,
  selected: -1,
  marks: ["normal", "normal", "normal", "normal"],
};

const QA_START: QaState = { group: 0, question: 0, revealed: false };

interface Cursor {
  loadedAt: number;
  level: Level;
  course: number;
  locked: boolean[];
  level1: ChoiceState;
  level2: ChoiceState;
  level4: QaState;
}

const START: Cursor = {
  loadedAt: 0,
  level: 0,
  course: -1,
  locked: SLOTS.map(() => false),
  level1: CHOICE_START,
  level2: CHOICE_START,
  level4: QA_START,
};

const groupsOf = <T,>(level: { groups: RetoGroup<T>[] } | undefined) =>
  level?.groups ?? [];

export function RetoCruzadoLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const setPosition = useGameState((s) => s.setPosition);
  const { play } = useAnimations();

  const session = useGameSession((s) => s.session) as RetoCruzadoSession | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);
  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const courses = session?.level0.courses ?? [];
  const { level, locked } = cursor;

  useEffect(() => {
    for (const value of LEVELS) setVisible(levelId(value), value === level);
  }, [level, setVisible]);

  useEffect(() => {
    const list = session?.level0.courses ?? [];
    for (const i of SLOTS) {
      const present = i < list.length;
      setVisible(courseId(i), present);
      if (!present) continue;
      patch(courseTextId(i), "text", { text: list[i] });
      setPosition(courseId(i), coursePosition(i, list.length));
    }
  }, [session, setVisible, patch, setPosition]);

  useEffect(() => {
    for (const i of SLOTS) {
      setVisible(courseFrameId(i), !locked[i]);
      setVisible(courseLockedId(i), locked[i]);
    }
  }, [locked, setVisible]);

  const choiceGroups = (value: 1 | 2) =>
    groupsOf<RetoChoiceQuestion>(value === 1 ? session?.level1 : session?.level2);

  const choiceQuestion = (value: 1 | 2) => {
    const state = value === 1 ? cursor.level1 : cursor.level2;
    return choiceGroups(value)[state.group]?.questions[state.question];
  };

  const level1Question = choiceQuestion(1);
  const level2Question = choiceQuestion(2);

  useEffect(() => {
    for (const [value, question] of [
      [1, level1Question],
      [2, level2Question],
    ] as [1 | 2, RetoChoiceQuestion | undefined][]) {
      patch(questionId(value), "text", { text: question?.question ?? "" });
      for (let i = 0; i < OPTION_COUNT[value]; i++) {
        patch(optionTextId(value, i), "text", {
          text: question?.options[i] ?? "",
        });
      }
    }
  }, [level1Question, level2Question, patch]);

  const level1Marks = cursor.level1.marks;
  const level2Marks = cursor.level2.marks;

  useEffect(() => {
    for (const [value, marks] of [
      [1, level1Marks],
      [2, level2Marks],
    ] as [1 | 2, Mark[]][]) {
      for (let i = 0; i < OPTION_COUNT[value]; i++) {
        for (const mark of MARKS) {
          setVisible(optionMarkId(value, i, mark), marks[i] === mark);
        }
      }
    }
  }, [level1Marks, level2Marks, setVisible]);

  const qaGroups = groupsOf(session?.level4);
  const qaQuestion = qaGroups[cursor.level4.group]?.questions[cursor.level4.question];
  const qaRevealed = cursor.level4.revealed;

  useEffect(() => {
    patch("level-4-question-text", "text", { text: qaQuestion?.question ?? "" });
    patch("level-4-answer-text", "text", { text: qaQuestion?.answer ?? "" });
  }, [qaQuestion, patch]);

  useEffect(() => {
    setVisible("level-4-answer", qaRevealed);
  }, [qaRevealed, setVisible]);

  const updateChoice = (updater: (state: ChoiceState) => ChoiceState) =>
    setCursor((c) =>
      c.level === 1
        ? { ...c, level1: updater(c.level1) }
        : { ...c, level2: updater(c.level2) },
    );

  const activeChoice = level === 1 ? cursor.level1 : cursor.level2;
  const activeChoiceLevel: 1 | 2 = level === 2 ? 2 : 1;

  const goToGroup = (index: number) => {
    if (index < 0) return;
    if (level === 0) {
      if (index >= courses.length) return;
      setCursor((c) => ({ ...c, course: index }));
      return;
    }
    if (level === 1 || level === 2) {
      if (index >= choiceGroups(activeChoiceLevel).length) return;
      updateChoice(() => ({ ...CHOICE_START, group: index }));
      return;
    }
    if (level === 4) {
      if (index >= qaGroups.length) return;
      setCursor((c) => ({ ...c, level4: { ...QA_START, group: index } }));
    }
  };

  const goToQuestion = (index: number) => {
    if (index < 0) return;
    if (level === 1 || level === 2) {
      const group = choiceGroups(activeChoiceLevel)[activeChoice.group];
      if (!group || index >= group.questions.length) return;
      updateChoice((state) => ({ ...CHOICE_START, group: state.group, question: index }));
      return;
    }
    if (level === 4) {
      const group = qaGroups[cursor.level4.group];
      if (!group || index >= group.questions.length) return;
      setCursor((c) => ({
        ...c,
        level4: { ...c.level4, question: index, revealed: false },
      }));
    }
  };

  const markOption = (index: number, value: Mark) =>
    updateChoice((state) => ({
      ...state,
      marks: state.marks.map((current, i) => (i === index ? value : current)),
    }));

  useGameKeys({
    onInsert: () => setCursor((c) => ({ ...c, level: 0 })),
    onHome: () => setCursor((c) => ({ ...c, level: 1 })),
    onPageUp: () => setCursor((c) => ({ ...c, level: 2 })),
    onDelete: () => setCursor((c) => ({ ...c, level: 3 })),
    onEnd: () => setCursor((c) => ({ ...c, level: 4 })),
    onNavigate: (value) => {
      if (value === 0) return;
      goToGroup(value - 1);
    },
    onNumber: goToQuestion,
    onLock: () => {
      if (level !== 0) return;
      const index = cursor.course;
      if (index < 0 || index >= courses.length) return;
      setCursor((c) => ({
        ...c,
        locked: c.locked.map((value, i) => (i === index ? true : value)),
      }));
      void play(courseId(index), "blink");
    },
    onUnlockAll: () => {
      if (level !== 0) return;
      setCursor((c) => ({ ...c, locked: SLOTS.map(() => false) }));
    },
    onOption: (index) => {
      if (level !== 1 && level !== 2) return;
      if (index >= OPTION_COUNT[activeChoiceLevel]) return;
      updateChoice((state) => ({ ...state, selected: index }));
    },
    onValidate: () => {
      if (level !== 1 && level !== 2) return;
      const question = choiceQuestion(activeChoiceLevel);
      if (!question || activeChoice.selected < 0) return;
      const correct = activeChoice.selected === question.correctIndex;
      markOption(activeChoice.selected, correct ? "correct" : "incorrect");
      playSound(correct ? SOUNDS.correct : SOUNDS.incorrect);
    },
    onShowAnswer: () => {
      if (level === 1 || level === 2) {
        const question = choiceQuestion(activeChoiceLevel);
        if (!question) return;
        markOption(question.correctIndex, "correct");
        playSound(SOUNDS.correct);
        return;
      }
      if (level === 4) {
        if (!qaQuestion) return;
        setCursor((c) => ({ ...c, level4: { ...c.level4, revealed: true } }));
        playSound(SOUNDS.correct);
        void play("level-4-main", "pop");
      }
    },
    onMarkError: () => {
      if (level !== 4) return;
      playSound(SOUNDS.incorrect);
      void play("level-4-main", "shake");
    },
  });

  return null;
}
