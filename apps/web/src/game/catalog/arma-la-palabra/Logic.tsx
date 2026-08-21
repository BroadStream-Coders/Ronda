"use client";

import { useEffect, useMemo, useState } from "react";

import {
  playSound,
  shuffledOrder,
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import { splitLetters } from "./letters";
import type { ArmaPalabraSession } from "./session";

const BOARD_ID = "board";

interface Cursor {
  loadedAt: number;
  group: number;
  slot: number;
  revealed: number;
}

const START: Cursor = { loadedAt: 0, group: 0, slot: 0, revealed: 0 };

export function ArmaLaPalabraLogic() {
  const patch = useGameState((s) => s.patch);
  const { play } = useAnimations();
  const session = useGameSession((s) => s.session) as ArmaPalabraSession | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);

  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const groups = session?.groups ?? [];
  const words = groups[cursor.group]?.words ?? [];
  const word = words[cursor.slot] ?? "";

  const letters = useMemo(() => splitLetters(word), [word]);
  const order = useMemo(
    () => shuffledOrder(letters.length, cursor.group * 100 + cursor.slot),
    [letters.length, cursor.group, cursor.slot],
  );
  const revealed = Math.min(cursor.revealed, letters.length);

  useEffect(() => {
    patch(BOARD_ID, "blanks", { letters, order, revealed });
  }, [letters, order, revealed, patch]);

  const goToSlot = (slot: number) =>
    setCursor((c) => ({ ...c, slot, revealed: 0 }));

  const revealNext = () => {
    if (revealed >= letters.length) return;
    setCursor((c) => ({ ...c, revealed: revealed + 1 }));
    if (revealed + 1 === letters.length) {
      playSound(SOUNDS.correct);
      void play(BOARD_ID, "pop");
    }
  };

  useGameKeys({
    onNumber: (value) => {
      if (value >= 0 && value < words.length) goToSlot(value);
    },
    onNavigate: (value) => {
      if (value < 0 || value >= groups.length) return;
      setCursor((c) => ({ ...c, group: value, slot: 0, revealed: 0 }));
    },
    onNext: () => {
      if (cursor.slot < words.length - 1) goToSlot(cursor.slot + 1);
    },
    onBack: () => {
      if (cursor.slot > 0) goToSlot(cursor.slot - 1);
    },
    onArrowRight: revealNext,
    onInteract: revealNext,
    onArrowLeft: () =>
      setCursor((c) => ({ ...c, revealed: Math.max(0, revealed - 1) })),
    onShowAnswer: () => {
      if (letters.length === 0 || revealed >= letters.length) return;
      setCursor((c) => ({ ...c, revealed: letters.length }));
      playSound(SOUNDS.correct);
      void play(BOARD_ID, "pop");
    },
    onMarkError: () => {
      playSound(SOUNDS.incorrect);
      void play(BOARD_ID, "shake");
    },
    onClear: () => setCursor((c) => ({ ...c, revealed: 0 })),
    onArrowUp: () => void play(BOARD_ID, "bounce"),
    onArrowDown: () => void play(BOARD_ID, "slide"),
  });

  return null;
}
