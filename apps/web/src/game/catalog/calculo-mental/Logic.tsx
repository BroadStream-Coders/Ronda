"use client";

import { useEffect, useMemo, useState } from "react";

import {
  playSound,
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import type { CalculoSession } from "./session";

const SLOT_COUNT = 4;
const SLOT_IDS = Array.from({ length: SLOT_COUNT }, (_, i) => `slot-${i}`);
const QUESTION_IDS = SLOT_IDS.map((id) => `${id}-question`);
const ANSWER_IDS = SLOT_IDS.map((id) => `${id}-answer`);

interface Cursor {
  loadedAt: number;
  group: number;
  board: number;
  slot: number;
}

const START: Cursor = { loadedAt: 0, group: 0, board: 0, slot: -1 };

export function CalculoMentalLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const { play, playStagger } = useAnimations();
  const session = useGameSession((s) => s.session) as CalculoSession | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);

  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const groups = session?.groups ?? [];
  const boards = groups[cursor.group]?.boards ?? [];
  const slots = useMemo(
    () => session?.groups[cursor.group]?.boards[cursor.board]?.slots ?? [],
    [session, cursor.group, cursor.board],
  );

  useEffect(() => {
    SLOT_IDS.forEach((id, i) => {
      patch(id, "slot", { status: "none" });
      patch(QUESTION_IDS[i], "text", { text: slots[i]?.question ?? "" });
      patch(ANSWER_IDS[i], "text", { text: slots[i]?.answer ?? "" });
      setVisible(QUESTION_IDS[i], false);
      setVisible(ANSWER_IDS[i], false);
    });
  }, [slots, patch, setVisible]);

  const move = (next: Partial<Cursor>) =>
    setCursor((c) => ({ ...c, slot: -1, ...next }));

  const selectGroup = (n: number) => {
    if (n < 0 || n >= groups.length) return;
    move({ group: n, board: 0 });
  };

  const selectBoard = (n: number) => {
    if (n < 0 || n >= boards.length) return;
    move({ board: n });
  };

  const nextBoard = () => {
    if (cursor.board >= boards.length - 1) return;
    move({ board: cursor.board + 1 });
  };

  const prevBoard = () => {
    if (cursor.board <= 0) return;
    move({ board: cursor.board - 1 });
  };

  const revealNextQuestion = () => {
    const next = cursor.slot + 1;
    if (next >= SLOT_COUNT || next >= slots.length) return;
    setVisible(QUESTION_IDS[next], true);
    setCursor((c) => ({ ...c, slot: next }));
  };

  const selectBackSlot = () => {
    if (cursor.slot < 0) return;
    setVisible(QUESTION_IDS[cursor.slot], false);
    setVisible(ANSWER_IDS[cursor.slot], false);
    patch(SLOT_IDS[cursor.slot], "slot", { status: "none" });
    setCursor((c) => ({ ...c, slot: c.slot - 1 }));
  };

  const showCurrentAnswer = () => {
    if (cursor.slot < 0) return;
    setVisible(ANSWER_IDS[cursor.slot], true);
    patch(SLOT_IDS[cursor.slot], "slot", { status: "correct" });
    playSound(SOUNDS.correct);
    play(SLOT_IDS[cursor.slot], "pop");
  };

  const markCurrentError = () => {
    if (cursor.slot < 0) return;
    patch(SLOT_IDS[cursor.slot], "slot", { status: "incorrect" });
    playSound(SOUNDS.incorrect);
    play(SLOT_IDS[cursor.slot], "shake");
  };

  const clearCurrent = () => {
    if (cursor.slot < 0) return;
    patch(SLOT_IDS[cursor.slot], "slot", { status: "none" });
  };

  useGameKeys({
    onNavigate: selectGroup,
    onNumber: selectBoard,
    onNext: nextBoard,
    onBack: prevBoard,
    onArrowRight: revealNextQuestion,
    onArrowLeft: selectBackSlot,
    onShowAnswer: showCurrentAnswer,
    onMarkError: markCurrentError,
    onClear: clearCurrent,
    onArrowUp: () => playStagger(SLOT_IDS, "bounce"),
    onArrowDown: () => playStagger(SLOT_IDS, "slide"),
  });

  return null;
}
