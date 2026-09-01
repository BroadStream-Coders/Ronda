"use client";

import { useEffect, useState } from "react";

import {
  playSound,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import { MAX_CHOICES, type IntrusoSession } from "./session";

const CHOICES = Array.from({ length: MAX_CHOICES }, (_, index) => index);
const MARKS = ["normal", "correct", "incorrect"] as const;

type Mark = (typeof MARKS)[number];
type Level = 1 | 2;

const PICTURE_ID = "picture";

const optionFrameId = (i: number, mark: Mark) => `option-${i}-frame-${mark}`;
const optionTextId = (i: number) => `option-${i}-text`;
const photoFrameId = (i: number, mark: Mark) => `photo-${i}-frame-${mark}`;
const photoTextId = (i: number) => `photo-${i}-text`;
const photoPictureId = (i: number) => `photo-${i}-picture`;

interface LevelState {
  round: number;
  selected: number;
  marks: Mark[];
}

const CLEAN: Omit<LevelState, "round"> = {
  selected: -1,
  marks: CHOICES.map(() => "normal"),
};

const FRESH: LevelState = { round: 0, ...CLEAN };

interface Cursor {
  loadedAt: number;
  level: Level;
  text: LevelState;
  photo: LevelState;
}

const START: Cursor = { loadedAt: 0, level: 1, text: FRESH, photo: FRESH };

export function IntrusoLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const session = useGameSession((s) => s.session) as IntrusoSession | null;
  const images = useGameSession((s) => s.images);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const textRounds = session?.textRounds ?? [];
  const photoRounds = session?.photoRounds ?? [];

  const [cursor, setCursor] = useState<Cursor>(START);

  if (cursor.loadedAt !== loadedAt) {
    const level: Level =
      textRounds.length > 0 || photoRounds.length === 0 ? 1 : 2;
    setCursor({ ...START, loadedAt, level });
  }

  const { level } = cursor;
  const textRound = textRounds[cursor.text.round];
  const photoRound = photoRounds[cursor.photo.round];

  useEffect(() => {
    setVisible("level-1", level === 1);
    setVisible("level-2", level === 2);
  }, [level, setVisible]);

  const picture = textRound ? (images[textRound.imagePath] ?? "") : "";
  useEffect(() => {
    patch(PICTURE_ID, "image", { src: picture });
    for (const i of CHOICES) {
      patch(optionTextId(i), "text", { text: textRound?.choices[i] ?? "" });
    }
  }, [picture, textRound, patch]);

  useEffect(() => {
    for (const i of CHOICES) {
      const choice = photoRound?.choices[i];
      patch(photoPictureId(i), "image", {
        src: choice ? (images[choice.imagePath] ?? "") : "",
      });
      patch(photoTextId(i), "text", { text: choice?.label ?? "" });
    }
  }, [photoRound, images, patch]);

  const textMarks = cursor.text.marks;
  useEffect(() => {
    for (const i of CHOICES) {
      for (const mark of MARKS) {
        setVisible(optionFrameId(i, mark), textMarks[i] === mark);
      }
    }
  }, [textMarks, setVisible]);

  const photoMarks = cursor.photo.marks;
  useEffect(() => {
    for (const i of CHOICES) {
      for (const mark of MARKS) {
        setVisible(photoFrameId(i, mark), photoMarks[i] === mark);
      }
    }
  }, [photoMarks, setVisible]);

  const activeRounds = level === 1 ? textRounds : photoRounds;
  const activeRound = level === 1 ? textRound : photoRound;
  const activeState = level === 1 ? cursor.text : cursor.photo;

  const updateActive = (updater: (state: LevelState) => LevelState) =>
    setCursor((c) =>
      c.level === 1
        ? { ...c, text: updater(c.text) }
        : { ...c, photo: updater(c.photo) },
    );

  const goTo = (index: number) => {
    if (index < 0 || index >= activeRounds.length) return;
    updateActive(() => ({ round: index, ...CLEAN }));
  };

  const mark = (choice: number, value: Mark) =>
    updateActive((state) => ({
      ...state,
      marks: state.marks.map((current, i) => (i === choice ? value : current)),
    }));

  useGameKeys({
    onHome: () => setCursor((c) => ({ ...c, level: 1 })),
    onPageUp: () => setCursor((c) => ({ ...c, level: 2 })),
    onNumber: goTo,
    onNext: () => goTo(activeState.round + 1),
    onBack: () => goTo(activeState.round - 1),
    onOption: (index) => {
      if (!activeRound || index >= MAX_CHOICES) return;
      updateActive((state) => ({ ...state, selected: index }));
    },
    onValidate: () => {
      if (!activeRound || activeState.selected < 0) return;
      const correct = activeState.selected === activeRound.answerIndex;
      mark(activeState.selected, correct ? "correct" : "incorrect");
      playSound(correct ? SOUNDS.correct : SOUNDS.incorrect);
    },
    onShowAnswer: () => {
      if (!activeRound) return;
      mark(activeRound.answerIndex, "correct");
      playSound(SOUNDS.correct);
    },
  });

  return null;
}
