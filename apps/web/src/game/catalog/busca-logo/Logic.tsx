"use client";

import { useEffect, useRef, useState } from "react";

import {
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameState,
  useLayerClick,
  type Layer,
} from "@/game/kit";
import { EMPTY_FACES } from "./assets";
import layout from "./layout.json";
import {
  BOARD_SIZE,
  CARD_BACK_IDS,
  CARD_COUNT,
  CARD_EMPTY_IDS,
  CARD_FRONT_IDS,
  CARD_IDS,
  CARD_LOCKED_IDS,
  CARD_LOGO_IDS,
  CARD_NORMAL_IDS,
  CARD_SELECTED_IDS,
  LEVEL_0_ID,
  LEVEL_0_MESSAGE_ID,
  LEVEL_2_ID,
} from "./constants";
import type { BuscaLogoSession } from "./session";

const FLIP_STEP_MS = 40;

const CARDS = Array.from({ length: CARD_COUNT }, (_, index) => index);
const NO_LOCKS = CARDS.map(() => false);

interface Cursor {
  loadedAt: number;
  board: number;
  selected: number;
  locked: boolean[];
  variant: boolean;
}

const START: Cursor = {
  loadedAt: 0,
  board: 0,
  selected: -1,
  locked: NO_LOCKS,
  variant: false,
};

export function BuscaLogoLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const { play } = useAnimations();

  const session = useGameSession((s) => s.session) as BuscaLogoSession | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);
  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const boards = session?.boards ?? [];
  const board = boards[cursor.board];
  const supported = board?.size === BOARD_SIZE;

  const faceUpRef = useRef<boolean[]>(CARDS.map(() => false));
  const flippingRef = useRef(new Set<number>());

  useEffect(() => {
    setVisible(LEVEL_2_ID, !board || supported);
    setVisible(LEVEL_0_ID, !!board && !supported);
    if (board && !supported) {
      patch(LEVEL_0_MESSAGE_ID, "text", {
        text: `Tablero ${cursor.board + 1} · formato ${board.size}\nNo disponible: solo está implementado ${BOARD_SIZE}`,
      });
    }
  }, [board, supported, cursor.board, patch, setVisible]);

  useEffect(() => {
    const logos = new Set(board?.logoPositions ?? []);
    faceUpRef.current = CARDS.map(() => false);
    for (const i of CARDS) {
      setVisible(CARD_BACK_IDS[i], true);
      setVisible(CARD_FRONT_IDS[i], false);
      setVisible(CARD_EMPTY_IDS[i], !logos.has(i));
      setVisible(CARD_LOGO_IDS[i], logos.has(i));
    }
  }, [board, setVisible]);

  const { selected, locked, variant } = cursor;

  useEffect(() => {
    for (const i of CARDS) {
      const isLocked = locked[i] === true;
      setVisible(CARD_LOCKED_IDS[i], isLocked);
      setVisible(CARD_SELECTED_IDS[i], !isLocked && selected === i);
      setVisible(CARD_NORMAL_IDS[i], !isLocked && selected !== i);
    }
  }, [selected, locked, setVisible]);

  useEffect(() => {
    const src = variant ? EMPTY_FACES.variant : EMPTY_FACES.normal;
    for (const i of CARDS) patch(CARD_EMPTY_IDS[i], "image", { src });
  }, [variant, patch]);

  const flipCard = async (i: number, up: boolean) => {
    if (i < 0 || flippingRef.current.has(i)) return;
    if (faceUpRef.current[i] === up) return;
    flippingRef.current.add(i);
    try {
      await play(CARD_IDS[i], "flipHide");
      faceUpRef.current[i] = up;
      setVisible(CARD_BACK_IDS[i], !up);
      setVisible(CARD_FRONT_IDS[i], up);
      await play(CARD_IDS[i], "flipShow");
    } finally {
      flippingRef.current.delete(i);
    }
  };

  const flipAll = (up: boolean) => {
    for (const i of CARDS) {
      window.setTimeout(() => void flipCard(i, up), i * FLIP_STEP_MS);
    }
  };

  useLayerClick(layout as Layer[], (layerId) => {
    const match = /^card-(\d+)$/.exec(layerId);
    if (!match) return;
    const index = Number(match[1]);
    if (index >= CARD_COUNT) return;
    setCursor((c) => ({ ...c, selected: index }));
  });

  const openBoard = (index: number) =>
    setCursor((c) =>
      index < 0 || index >= boards.length
        ? c
        : { ...c, board: index, selected: -1, locked: NO_LOCKS },
    );

  useGameKeys({
    onNavigate: (value) => openBoard(value - 1),
    onNext: () => openBoard(cursor.board + 1),
    onInteract: () => void flipCard(selected, true),
    onBack: () => void flipCard(selected, false),
    onClear: () => setCursor((c) => ({ ...c, selected: -1, locked: NO_LOCKS })),
    onLock: () =>
      setCursor((c) =>
        c.selected < 0
          ? c
          : {
              ...c,
              locked: c.locked.map((value, i) =>
                i === c.selected ? !value : value,
              ),
            },
      ),
    onUnlockAll: () => setCursor((c) => ({ ...c, locked: NO_LOCKS })),
    onInteractAll: () => flipAll(true),
    onShowAnswerAll: () => flipAll(false),
    onArrowLeft: () => setCursor((c) => ({ ...c, variant: false })),
    onArrowRight: () => setCursor((c) => ({ ...c, variant: true })),
  });

  return null;
}
