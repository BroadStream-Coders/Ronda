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
import layout from "./layout.json";
import {
  BOARD_SIZES,
  EMPTY_FACES,
  FALLBACK_LEVEL,
  LEVELS,
  LEVEL_0_ID,
  LEVEL_0_MESSAGE_ID,
  LEVEL_LIST,
  MAX_CARDS,
  type LevelSpec,
} from "./constants";
import type { BuscaLogoSession } from "./session";

const FLIP_STEP_MS = 40;

const NO_LOCKS = Array.from({ length: MAX_CARDS }, () => false);

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
  const level: LevelSpec | undefined = board
    ? LEVELS[board.size]
    : FALLBACK_LEVEL;

  const faceUpRef = useRef(new Set<string>());
  const flippingRef = useRef(new Set<string>());

  useEffect(() => {
    for (const spec of LEVEL_LIST) setVisible(spec.id, spec === level);
    setVisible(LEVEL_0_ID, !!board && !level);
    if (board && !level) {
      patch(LEVEL_0_MESSAGE_ID, "text", {
        text: `Tablero ${cursor.board + 1} · formato ${board.size}\nLos formatos disponibles son ${BOARD_SIZES.join(", ")}`,
      });
    }
  }, [board, level, cursor.board, patch, setVisible]);

  useEffect(() => {
    if (!level) return;
    const logos = new Set(board?.logoPositions ?? []);
    faceUpRef.current = new Set();
    for (let i = 0; i < level.count; i++) {
      setVisible(level.backs[i], true);
      setVisible(level.fronts[i], false);
      setVisible(level.empties[i], !logos.has(i));
      setVisible(level.logos[i], logos.has(i));
    }
  }, [board, level, setVisible]);

  const { selected, locked, variant } = cursor;

  useEffect(() => {
    if (!level) return;
    for (let i = 0; i < level.count; i++) {
      const isLocked = locked[i] === true;
      setVisible(level.lockeds[i], isLocked);
      setVisible(level.selecteds[i], !isLocked && selected === i);
      setVisible(level.normals[i], !isLocked && selected !== i);
    }
  }, [selected, locked, level, setVisible]);

  useEffect(() => {
    if (!level) return;
    const faces = EMPTY_FACES[level.id];
    const src = variant ? faces.variant : faces.normal;
    for (let i = 0; i < level.count; i++) {
      patch(level.empties[i], "image", { src });
    }
  }, [variant, level, patch]);

  const flipCard = async (index: number, up: boolean) => {
    if (!level || index < 0 || index >= level.count) return;
    const id = level.cards[index];
    if (flippingRef.current.has(id)) return;
    if (faceUpRef.current.has(id) === up) return;
    flippingRef.current.add(id);
    try {
      await play(id, "flipHide");
      if (up) faceUpRef.current.add(id);
      else faceUpRef.current.delete(id);
      setVisible(level.backs[index], !up);
      setVisible(level.fronts[index], up);
      await play(id, "flipShow");
    } finally {
      flippingRef.current.delete(id);
    }
  };

  const flipAll = (up: boolean) => {
    if (!level) return;
    for (let i = 0; i < level.count; i++) {
      window.setTimeout(() => void flipCard(i, up), i * FLIP_STEP_MS);
    }
  };

  useLayerClick(layout as Layer[], (layerId) => {
    if (!level) return;
    const prefix = `${level.id}-card-`;
    if (!layerId.startsWith(prefix)) return;
    const index = Number(layerId.slice(prefix.length));
    if (!Number.isInteger(index) || index >= level.count) return;
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
