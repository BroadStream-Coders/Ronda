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
import type { ArmaOracionSession } from "./session";
import { shuffledOrder, splitWords } from "./words";

const BOARD_ID = "board";

interface Cursor {
  loadedAt: number;
  group: number;
  slot: number;
  solved: boolean;
}

const START: Cursor = { loadedAt: 0, group: 0, slot: 0, solved: false };

export function ArmaLaOracionLogic() {
  const patch = useGameState((s) => s.patch);
  const { play } = useAnimations();
  const session = useGameSession((s) => s.session) as ArmaOracionSession | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);

  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const groups = session?.groups ?? [];
  const sentences = groups[cursor.group]?.sentences ?? [];
  const sentence = sentences[cursor.slot] ?? "";

  const words = useMemo(() => splitWords(sentence), [sentence]);
  const order = useMemo(
    () => shuffledOrder(words.length, cursor.group * 100 + cursor.slot),
    [words.length, cursor.group, cursor.slot],
  );

  useEffect(() => {
    patch(BOARD_ID, "sentence", { words, order, solved: cursor.solved });
  }, [words, order, cursor.solved, patch]);

  const goToSlot = (slot: number) =>
    setCursor((c) => ({ ...c, slot, solved: false }));

  useGameKeys({
    onNumber: (value) => {
      if (value >= 0 && value < sentences.length) goToSlot(value);
    },
    onNavigate: (value) => {
      if (value < 0 || value >= groups.length) return;
      setCursor((c) => ({ ...c, group: value, slot: 0, solved: false }));
    },
    onNext: () => {
      if (cursor.slot < sentences.length - 1) goToSlot(cursor.slot + 1);
    },
    onBack: () => {
      if (cursor.slot > 0) goToSlot(cursor.slot - 1);
    },
    onShowAnswer: () => {
      if (cursor.solved || words.length === 0) return;
      setCursor((c) => ({ ...c, solved: true }));
      playSound(SOUNDS.correct);
      void play(BOARD_ID, "pop");
    },
    onMarkError: () => {
      playSound(SOUNDS.incorrect);
      void play(BOARD_ID, "shake");
    },
    onClear: () => setCursor((c) => ({ ...c, solved: false })),
    onArrowUp: () => void play(BOARD_ID, "bounce"),
    onArrowDown: () => void play(BOARD_ID, "slide"),
  });

  return null;
}
