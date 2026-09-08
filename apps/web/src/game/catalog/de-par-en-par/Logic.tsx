"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  playSound,
  shuffledOrder,
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameState,
  useLayerClick,
  type Layer,
} from "@/game/kit";
import { SOUNDS } from "./assets";
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
  const flightRef = useRef(new Map<number, Promise<void>>());
  const selectionRef = useRef<number[]>([]);

  useEffect(() => {
    faceUpRef.current = SLOTS.map(() => false);
    flightRef.current.clear();
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

  const flipCard = (i: number, up: boolean) => {
    const inFlight = flightRef.current.get(i);
    if (inFlight) return inFlight;
    if (faceUpRef.current[i] === up) return Promise.resolve();

    const run = (async () => {
      try {
        await play(cardId(i), "flipHide");
        faceUpRef.current[i] = up;
        setVisible(backId(i), !up);
        setVisible(frontId(i), up);
        await play(cardId(i), "flipShow");
      } finally {
        flightRef.current.delete(i);
      }
    })();

    flightRef.current.set(i, run);
    return run;
  };

  const flipAll = (up: boolean) => {
    selectionRef.current = [];
    return Promise.all(SLOTS.map((i) => flipCard(i, up)));
  };

  const toggleAll = () => flipAll(!faceUpRef.current.some((up) => up));

  const clickCard = (i: number) => {
    if (flightRef.current.has(i)) return;

    const up = !faceUpRef.current[i];
    const selection = selectionRef.current;

    if (up) {
      if (selection.length < 2) selectionRef.current = [...selection, i];
    } else {
      selectionRef.current = selection.filter((slot) => slot !== i);
    }

    void flipCard(i, up);
  };

  const validate = async () => {
    const selection = selectionRef.current;
    if (selection.length < 2) return;

    const [first, second] = selection;
    selectionRef.current = [];

    await Promise.all(selection.map((i) => flightRef.current.get(i)));

    const pairOf = (i: number) => resolveSlot(session, order[i])?.pair;
    const pair = pairOf(first);

    if (pair !== undefined && pair === pairOf(second)) {
      playSound(SOUNDS.correct);
      await Promise.all([
        play(cardId(first), "pop"),
        play(cardId(second), "pop"),
      ]);
      return;
    }

    playSound(SOUNDS.incorrect);
    await Promise.all([
      play(cardId(first), "shake"),
      play(cardId(second), "shake"),
    ]);
    await Promise.all([flipCard(first, false), flipCard(second, false)]);
  };

  useLayerClick(layout as Layer[], (layerId) =>
    clickCard(slotOfLayer(layerId)),
  );

  const mouseRef = useRef({ toggleAll, validate });
  useEffect(() => {
    mouseRef.current = { toggleAll, validate };
  });

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button === 1) {
        event.preventDefault();
        void mouseRef.current.toggleAll();
        return;
      }
      if (event.button === 2) {
        event.preventDefault();
        void mouseRef.current.validate();
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useGameKeys({
    onValidate: () => void validate(),
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
