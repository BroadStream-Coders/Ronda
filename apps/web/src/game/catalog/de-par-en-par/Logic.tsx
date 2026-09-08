"use client";

import { useEffect, useRef } from "react";

import {
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
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

export function DeParEnParLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const { play } = useAnimations();

  const session = useGameSession(
    (s) => s.session,
  ) as DeParEnParSession | null;
  const images = useGameSession((s) => s.images);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const faceUpRef = useRef<boolean[]>(SLOTS.map(() => false));
  const flippingRef = useRef(new Set<number>());

  useEffect(() => {
    faceUpRef.current = SLOTS.map(() => false);
    flippingRef.current.clear();

    for (const i of SLOTS) {
      const card = resolveSlot(session, i)?.card;
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
  }, [session, images, loadedAt, patch, setVisible]);

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

  const flipAll = (up: boolean) =>
    Promise.all(SLOTS.map((i) => flipCard(i, up)));

  useGameKeys({
    onMarkError: () => void flipAll(true),
    onBack: () => void flipAll(false),
  });

  return null;
}
