"use client";

import { useEffect, useRef, useState } from "react";

import {
  playSound,
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
import { CARD_COLORS, CARD_CROMA, SOUNDS } from "./assets";
import type { AlbumSession } from "./session";

const CARD_COUNT = 5;
const THEME_COUNT = 6;
const FLIP_STEP_MS = 80;

const CARDS = Array.from({ length: CARD_COUNT }, (_, index) => index);
const THEMES = Array.from({ length: THEME_COUNT }, (_, index) => index);

const THEMES_ID = "themes";
const GAMEPLAY_ID = "gameplay";
const ROUND_TITLE_ID = "round-title";

const cardId = (i: number) => `card-${i}`;
const backId = (i: number) => `card-${i}-back`;
const frontId = (i: number) => `card-${i}-front`;
const backBgId = (i: number) => `card-${i}-back-bg`;
const frontBgId = (i: number) => `card-${i}-front-bg`;
const questionId = (i: number) => `card-${i}-question`;
const photoId = (i: number) => `card-${i}-photo`;
const photoColorId = (i: number) => `card-${i}-photo-color`;
const photoGrayId = (i: number) => `card-${i}-photo-gray`;
const themeNormalId = (i: number) => `theme-${i}-normal`;
const themeLockedId = (i: number) => `theme-${i}-locked`;
const themeNormalTitleId = (i: number) => `theme-${i}-normal-title`;
const themeLockedTitleId = (i: number) => `theme-${i}-locked-title`;

type View = "themes" | "cards";

interface Cursor {
  loadedAt: number;
  round: number;
  card: number;
  view: View;
  locked: boolean[];
}

const START: Cursor = {
  loadedAt: 0,
  round: 0,
  card: 0,
  view: "themes",
  locked: THEMES.map(() => false),
};

export function AlbumLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const { play } = useAnimations();

  const session = useGameSession((s) => s.session) as AlbumSession | null;
  const images = useGameSession((s) => s.images);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);
  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const rounds = session?.rounds ?? [];
  const round = rounds[cursor.round];

  const faceUpRef = useRef<boolean[]>(CARDS.map(() => false));
  const flippingRef = useRef(new Set<number>());

  useEffect(() => {
    const list = session?.rounds ?? [];
    for (const i of THEMES) {
      const title = list[i]?.title ?? "";
      patch(themeNormalTitleId(i), "text", { text: title });
      patch(themeLockedTitleId(i), "text", { text: title });
    }
  }, [session, patch]);

  const { view, locked } = cursor;

  useEffect(() => {
    setVisible(THEMES_ID, view === "themes");
    setVisible(GAMEPLAY_ID, view === "cards");
  }, [view, setVisible]);

  useEffect(() => {
    for (const i of THEMES) {
      setVisible(themeNormalId(i), !locked[i]);
      setVisible(themeLockedId(i), locked[i]);
    }
  }, [locked, setVisible]);

  useEffect(() => {
    patch(ROUND_TITLE_ID, "text", { text: round?.title ?? "" });
    const color = CARD_COLORS[cursor.round] ?? CARD_COLORS[0];
    faceUpRef.current = CARDS.map(() => false);

    for (const i of CARDS) {
      const card = round?.cards[i];
      const background = card?.isCroma ? CARD_CROMA : color;
      const photo = card ? (images[card.imagePath] ?? "") : "";

      patch(cardId(i), "holo", { enabled: !!card?.isCroma });
      patch(photoColorId(i), "sparkles", { enabled: !!card?.isCroma });
      patch(backBgId(i), "image", { src: background });
      patch(frontBgId(i), "image", { src: background });
      patch(questionId(i), "text", { text: card?.question ?? "" });
      patch(photoColorId(i), "image", { src: photo });
      patch(photoGrayId(i), "image", { src: photo });

      setVisible(backId(i), true);
      setVisible(frontId(i), false);
      setVisible(questionId(i), true);
      setVisible(photoId(i), false);
      setVisible(photoColorId(i), true);
      setVisible(photoGrayId(i), false);
    }
  }, [round, cursor.round, images, patch, setVisible]);

  const showPhoto = (i: number, gray: boolean) => {
    setVisible(questionId(i), false);
    setVisible(photoId(i), true);
    setVisible(photoColorId(i), !gray);
    setVisible(photoGrayId(i), gray);
  };

  const flipCard = async (i: number, up: boolean) => {
    if (flippingRef.current.has(i)) return;
    if (faceUpRef.current[i] === up) return;
    flippingRef.current.add(i);
    try {
      await play(cardId(i), "flipHide");
      faceUpRef.current[i] = up;
      setVisible(backId(i), !up);
      setVisible(frontId(i), up);
      await play(cardId(i), "flipShow");
    } finally {
      flippingRef.current.delete(i);
    }
  };

  useGameKeys({
    onNumber: (value) => {
      if (value < 0 || value >= CARD_COUNT) return;
      setCursor((c) => ({ ...c, card: value }));
    },
    onNavigate: (value) => {
      const index = value - 1;
      if (value === 0 || index >= THEME_COUNT || index >= rounds.length) return;
      setCursor((c) => ({ ...c, round: index, card: 0 }));
    },
    onInsert: () => setCursor((c) => ({ ...c, view: "themes" })),
    onHome: () => setCursor((c) => ({ ...c, view: "cards" })),
    onInteract: () => void flipCard(cursor.card, true),
    onBack: () => void flipCard(cursor.card, false),
    onClear: () => {
      setVisible(questionId(cursor.card), true);
      setVisible(photoId(cursor.card), false);
    },
    onShowAnswer: () => {
      showPhoto(cursor.card, false);
      playSound(SOUNDS.correct);
    },
    onMarkError: () => {
      showPhoto(cursor.card, true);
      playSound(SOUNDS.incorrect);
    },
    onLock: () =>
      setCursor((c) => ({
        ...c,
        locked: c.locked.map((value, i) => (i === c.round ? !value : value)),
      })),
    onInteractAll: () => {
      for (const i of CARDS) {
        window.setTimeout(() => void flipCard(i, true), i * FLIP_STEP_MS);
      }
    },
    onShowAnswerAll: () => {
      for (const i of CARDS) showPhoto(i, false);
    },
  });

  return null;
}
