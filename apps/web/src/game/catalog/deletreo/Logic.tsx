"use client";

import { useEffect, useState } from "react";

import { useGameKeys, useGameSession, useGameState } from "@/game/kit";
import type { DeletreoSession } from "./session";

const FRAME_ID = "frame";
const WORD_ID = "word";
const FRAME_NORMAL = "#141b2d";
const FRAME_ERROR = "#7f1d1d";

interface Cursor {
  loadedAt: number;
  group: number;
  slot: number;
  revealed: number;
  error: boolean;
}

const START: Cursor = {
  loadedAt: 0,
  group: 0,
  slot: 0,
  revealed: 0,
  error: false,
};

export function DeletreoLogic() {
  const patch = useGameState((s) => s.patch);
  const session = useGameSession((s) => s.session) as DeletreoSession | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);

  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const groups = session?.groups ?? [];
  const words = groups[cursor.group]?.words ?? [];
  const word = words[cursor.slot] ?? "";
  const revealed = Math.min(cursor.revealed, word.length);

  useEffect(() => {
    patch(WORD_ID, "spelling", { word, revealed });
  }, [word, revealed, patch]);

  useEffect(() => {
    patch(FRAME_ID, "color", {
      value: cursor.error ? FRAME_ERROR : FRAME_NORMAL,
    });
  }, [cursor.error, patch]);

  const goToSlot = (slot: number) =>
    setCursor((c) => ({ ...c, slot, revealed: 0, error: false }));

  useGameKeys({
    onNumber: (value) => {
      if (value >= 0 && value < words.length) goToSlot(value);
    },
    onNavigate: (value) => {
      if (value < 0 || value >= groups.length) return;
      setCursor((c) => ({
        ...c,
        group: value,
        slot: 0,
        revealed: 0,
        error: false,
      }));
    },
    onNext: () => {
      if (cursor.slot < words.length - 1) goToSlot(cursor.slot + 1);
    },
    onBack: () => {
      if (cursor.slot > 0) goToSlot(cursor.slot - 1);
    },
    onInteract: () =>
      setCursor((c) => ({ ...c, revealed: Math.min(c.revealed + 1, word.length) })),
    onShowAnswer: () =>
      setCursor((c) => ({ ...c, revealed: word.length, error: false })),
    onMarkError: () => setCursor((c) => ({ ...c, error: true })),
  });

  return null;
}
