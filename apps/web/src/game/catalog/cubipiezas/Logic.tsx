"use client";

import { useEffect, useState } from "react";

import type { Data } from "@/collector/catalog/cubipiezas/schema";
import {
  playSound,
  settingKey,
  useGameKeys,
  useGameSession,
  useGameSetting,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import {
  BLUR_MAX,
  blurFilter,
  blurFor,
  CARD_COUNT,
  cardId,
  nextStatus,
  type CardAction,
  type CardStatus,
} from "./cards";
import { meta } from "./meta";

const PHOTO_ID = "photo";
const FRESH: CardStatus[] = Array(CARD_COUNT).fill("letter");
const REVEALED: CardStatus[] = Array(CARD_COUNT).fill("hidden");

interface Cursor {
  loadedAt: number;
  round: number;
  card: number;
  cards: CardStatus[];
  peek: boolean;
}

const START: Cursor = {
  loadedAt: 0,
  round: 0,
  card: 0,
  cards: FRESH,
  peek: false,
};

export function CubipiezasLogic({ programId }: { programId: string }) {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);

  const session = useGameSession((s) => s.session) as Data | null;
  const images = useGameSession((s) => s.images);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [setting] = useGameSetting(
    settingKey(programId, meta.id, "blur"),
    String(BLUR_MAX),
  );
  const blurMax = Number(setting) || 0;

  const [cursor, setCursor] = useState<Cursor>(START);

  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const rounds = session?.rounds ?? [];
  const round = rounds[cursor.round];

  useEffect(() => {
    patch(PHOTO_ID, "image", {
      src: round ? (images[round.imagePath] ?? "") : "",
      filter: blurFilter(blurFor(cursor.cards, blurMax)),
    });
  }, [round, images, cursor.cards, blurMax, patch]);

  useEffect(() => {
    cursor.cards.forEach((status, index) => {
      const id = cardId(index);
      const question = round?.questions[index];
      setVisible(id, status !== "hidden" && !cursor.peek);
      setVisible(`${id}-letter`, status === "letter");
      setVisible(`${id}-question`, status === "question" || status === "answer");
      patch(`${id}-question`, "text", {
        text: (status === "answer" ? question?.answer : question?.question) ?? "",
      });
    });
  }, [round, cursor.cards, cursor.peek, patch, setVisible]);

  const act = (action: CardAction) => {
    if (!round) return;
    setCursor((c) => ({
      ...c,
      cards: c.cards.map((status, index) =>
        index === c.card ? nextStatus(status, action) : status,
      ),
    }));
  };

  useGameKeys({
    onNavigate: (value) => {
      const index = value - 1;
      if (value === 0 || index >= rounds.length) return;
      setCursor((c) => ({ ...c, round: index, card: 0, cards: FRESH, peek: false }));
    },
    onNumber: (value) => {
      if (value >= CARD_COUNT) return;
      setCursor((c) => ({ ...c, card: value }));
    },
    onInteract: () => act("interact"),
    onShowAnswer: () => {
      if (!round) return;
      act("showAnswer");
      playSound(SOUNDS.correct);
    },
    onMarkError: () => {
      if (!round) return;
      act("reset");
      playSound(SOUNDS.incorrect);
    },
    onLock: () => act("hide"),
    onRevealAll: () => {
      if (!round) return;
      setCursor((c) => ({ ...c, cards: REVEALED, peek: false }));
    },
    onPeek: () => {
      if (!round) return;
      setCursor((c) => ({ ...c, peek: !c.peek }));
    },
  });

  return null;
}
