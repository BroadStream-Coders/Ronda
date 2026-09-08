"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  shuffledOrder,
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameState,
  useLayerClick,
  type Layer,
} from "@/game/kit";
import layout from "./layout.json";
import { resolveSlot, type DeParEnParSession } from "./session";

const SLOT_COUNT = 20;
const SLOTS = Array.from({ length: SLOT_COUNT }, (_, index) => index);

const CARD_TEXT = 0;
const CARD_IMAGE = 1;
const CARD_BOTH = 2;

const cardId = (i: number) => `card-${i}`;
const backId = (i: number) => `card-${i}-back`;
const frontId = (i: number) => `card-${i}-front`;
const textId = (i: number) => `card-${i}-text`;
const imageId = (i: number) => `card-${i}-image`;
const bothId = (i: number) => `card-${i}-both`;
const bothTextId = (i: number) => `card-${i}-both-text`;
const bothImageId = (i: number) => `card-${i}-both-image`;

const slotOfLayer = (layerId: string) => Number(layerId.slice("card-".length));

interface Board {
  loadedAt: number;
  shuffles: number;
}

export function DeParEnParLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const { play } = useAnimations();

  const session = useGameSession(
    (s) => s.session,
  ) as DeParEnParSession | null;
  const images = useGameSession((s) => s.images);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [board, setBoard] = useState<Board>({ loadedAt: 0, shuffles: 0 });
  if (board.loadedAt !== loadedAt) setBoard({ loadedAt, shuffles: 0 });

  const order = useMemo(() => {
    const answer = session?.answer ?? [];
    if (board.shuffles === 0) return answer;
    return shuffledOrder(answer.length, board.shuffles).map((i) => answer[i]);
  }, [session, board.shuffles]);

  const faceUpRef = useRef<boolean[]>(SLOTS.map(() => false));
  const flippingRef = useRef(new Set<number>());
  const selectionRef = useRef<number[]>([]);

  useEffect(() => {
    faceUpRef.current = SLOTS.map(() => false);
    flippingRef.current.clear();
    selectionRef.current = [];

    for (const i of SLOTS) {
      const card = resolveSlot(session, order[i])?.card;
      const text = card?.text ?? "";
      const picture = card?.pictureFile
        ? (images[card.pictureFile] ?? "")
        : "";

      patch(textId(i), "text", { text });
      patch(bothTextId(i), "text", { text });
      patch(imageId(i), "image", { src: picture });
      patch(bothImageId(i), "image", { src: picture });

      setVisible(textId(i), card?.type === CARD_TEXT);
      setVisible(imageId(i), card?.type === CARD_IMAGE);
      setVisible(bothId(i), card?.type === CARD_BOTH);

      setVisible(backId(i), true);
      setVisible(frontId(i), false);
    }
  }, [session, order, images, patch, setVisible]);

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

  const flipAll = (up: boolean) => {
    selectionRef.current = [];
    return Promise.all(SLOTS.map((i) => flipCard(i, up)));
  };

  const toggleAll = () =>
    flipAll(!faceUpRef.current.some((up) => up));

  const clickCard = (i: number) => {
    if (flippingRef.current.has(i)) return;

    const up = !faceUpRef.current[i];
    const selection = selectionRef.current;

    if (up) {
      if (selection.length < 2) selectionRef.current = [...selection, i];
    } else {
      selectionRef.current = selection.filter((slot) => slot !== i);
    }

    void flipCard(i, up);
  };

  useLayerClick(layout as Layer[], (layerId) =>
    clickCard(slotOfLayer(layerId)),
  );

  const auxRef = useRef(toggleAll);
  useEffect(() => {
    auxRef.current = toggleAll;
  });

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 1) return;
      event.preventDefault();
      void auxRef.current();
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useGameKeys({
    onMarkError: () => void flipAll(true),
    onBack: () => void flipAll(false),
    onClear: () => {
      selectionRef.current = [];
    },
    onStart: () =>
      setBoard((current) => ({ ...current, shuffles: current.shuffles + 1 })),
  });

  return null;
}
