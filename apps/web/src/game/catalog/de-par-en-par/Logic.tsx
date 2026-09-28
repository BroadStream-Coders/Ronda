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
const COLS = 5;
const SLOTS = Array.from({ length: SLOT_COUNT }, (_, index) => index);
const DIAGONAL = [...SLOTS].sort(
  (a, b) =>
    (a % COLS) + Math.floor(a / COLS) - ((b % COLS) + Math.floor(b / COLS)) ||
    a - b,
);

const CARD_TEXT = 0;
const CARD_IMAGE = 1;
const CARD_BOTH = 2;

const CELEBRATION_ID = "celebration";

const cardId = (i: number) => `card-${i}`;
const backId = (i: number) => `card-${i}-back`;
const frontId = (i: number) => `card-${i}-front`;
const textId = (i: number) => `card-${i}-text`;
const imageId = (i: number) => `card-${i}-image`;
const bothId = (i: number) => `card-${i}-both`;
const bothTextId = (i: number) => `card-${i}-both-text`;
const bothImageId = (i: number) => `card-${i}-both-image`;
const errorId = (i: number) => `card-${i}-error`;
const glintId = (i: number) => `card-${i}-glint`;

const ERROR_BLINK_MS = 100;
const WAVE_STEP_MS = 40;
const CELEBRATION_STEP_MS = 60;
const PAIR_SPARKLES_MS = 1000;
const CELEBRATION_MS = 2500;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const nextFrame = () =>
  new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r())),
  );

const slotOfLayer = (layerId: string) => Number(layerId.slice("card-".length));

interface Board {
  loadedAt: number;
  shuffles: number;
}

export function DeParEnParLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const { play, playStagger } = useAnimations();

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
  const matchedRef = useRef(new Set<number>());
  const lockedRef = useRef(false);

  useEffect(() => {
    faceUpRef.current = SLOTS.map(() => false);
    flightRef.current.clear();
    selectionRef.current = [];
    matchedRef.current = new Set();
    patch(CELEBRATION_ID, "sparkles", { enabled: false });

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
      patch(cardId(i), "sparkles", { enabled: false });

      setVisible(textId(i), card?.type === CARD_TEXT);
      setVisible(imageId(i), card?.type === CARD_IMAGE);
      setVisible(bothId(i), card?.type === CARD_BOTH);

      setVisible(backId(i), true);
      setVisible(frontId(i), false);
      setVisible(errorId(i), false);
      setVisible(glintId(i), false);
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
        setVisible(errorId(i), false);
        setVisible(glintId(i), false);
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

  const blinkError = (i: number) => {
    const run = (async () => {
      try {
        setVisible(errorId(i), true);
        await delay(ERROR_BLINK_MS);
        setVisible(errorId(i), false);
        await delay(ERROR_BLINK_MS);
        setVisible(errorId(i), true);
        await delay(ERROR_BLINK_MS);
      } finally {
        flightRef.current.delete(i);
      }
    })();

    flightRef.current.set(i, run);
    return run;
  };

  const withLock = async (job: () => Promise<void>) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    try {
      await job();
    } finally {
      lockedRef.current = false;
    }
  };

  const deal = (swap?: () => void) =>
    withLock(async () => {
      selectionRef.current = [];
      await Promise.all(SLOTS.map((i) => flightRef.current.get(i)));
      await Promise.all(SLOTS.map((i) => play(cardId(i), "flipHide")));
      swap?.();
      await nextFrame();
      await playStagger(DIAGONAL.map(cardId), "flipShow", WAVE_STEP_MS);
    });

  const flipAll = (up: boolean) =>
    withLock(async () => {
      selectionRef.current = [];
      if (!up) matchedRef.current = new Set();
      await Promise.all(
        DIAGONAL.map(async (i, step) => {
          await delay(step * WAVE_STEP_MS);
          await flipCard(i, up);
        }),
      );
    });

  const toggleAll = () => flipAll(!faceUpRef.current.some((up) => up));

  const celebrate = () => {
    patch(CELEBRATION_ID, "sparkles", { enabled: true });
    void delay(CELEBRATION_MS).then(() =>
      patch(CELEBRATION_ID, "sparkles", { enabled: false }),
    );
    return playStagger(DIAGONAL.map(cardId), "wiggle", CELEBRATION_STEP_MS);
  };

  const clickCard = (i: number) => {
    if (lockedRef.current || flightRef.current.has(i)) return;

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
    if (lockedRef.current || selection.length < 2) return;

    const [first, second] = selection;
    selectionRef.current = [];

    await Promise.all(selection.map((i) => flightRef.current.get(i)));

    const pairOf = (i: number) => resolveSlot(session, order[i])?.pair;
    const pair = pairOf(first);

    if (pair !== undefined && pair === pairOf(second)) {
      playSound(SOUNDS.correct);
      matchedRef.current.add(pair);
      for (const i of selection) {
        setVisible(glintId(i), true);
        patch(cardId(i), "sparkles", { enabled: true });
      }
      void delay(PAIR_SPARKLES_MS).then(() => {
        for (const i of selection) {
          patch(cardId(i), "sparkles", { enabled: false });
          setVisible(glintId(i), false);
        }
      });
      await Promise.all(selection.map((i) => play(cardId(i), "wiggle")));

      const pairs = session?.cells.length ?? 0;
      if (pairs > 0 && matchedRef.current.size === pairs) await celebrate();
      return;
    }

    playSound(SOUNDS.incorrect);
    await Promise.all([
      ...selection.map((i) => blinkError(i)),
      ...selection.map((i) => play(cardId(i), "shake")),
    ]);
    await Promise.all([flipCard(first, false), flipCard(second, false)]);
  };

  useLayerClick(layout as Layer[], (layerId) =>
    clickCard(slotOfLayer(layerId)),
  );

  const latestRef = useRef({ toggleAll, validate, deal });
  useEffect(() => {
    latestRef.current = { toggleAll, validate, deal };
  });

  useEffect(() => {
    if (loadedAt) void latestRef.current.deal();
  }, [loadedAt]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button === 1) {
        event.preventDefault();
        void latestRef.current.toggleAll();
        return;
      }
      if (event.button === 2) {
        event.preventDefault();
        void latestRef.current.validate();
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
      void deal(() =>
        setBoard((current) => ({ ...current, shuffles: current.shuffles + 1 })),
      ),
    onRevealAll: () => {
      if (lockedRef.current) return;
      playSound(SOUNDS.correct);
      void celebrate();
    },
  });

  return null;
}
