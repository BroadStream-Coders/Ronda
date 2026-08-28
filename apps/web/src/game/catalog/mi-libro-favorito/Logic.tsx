"use client";

import { useEffect, useState } from "react";

import {
  playSound,
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import type { MiLibroSession } from "./session";

const PLAYER_COUNT = 2;
const MAX_HEART_SLOTS = 5;
const SIDES = ["left", "right"] as const;

const QUESTION_FRAME_ID = "question-frame";
const QUESTION_TEXT_ID = "question-text";
const CONTENT_IDS = SIDES.map((side) => `content-${side}`);
const NAME_TEXT_IDS = SIDES.map((side) => `name-text-${side}`);

const heartIds = (prefix: string) =>
  SIDES.map((side) =>
    Array.from(
      { length: MAX_HEART_SLOTS },
      (_, index) => `heart-${prefix}-${side}-${index}`,
    ),
  );

const HEART_SLOT_IDS = heartIds("slot");
const HEART_ROOT_IDS = heartIds("root");
const FULL_HEART_IDS = heartIds("full");
const BROKEN_HEART_IDS = heartIds("broken");

const BANNER_SCALE = 0.92;
const HEART_PITCH = (82 + 9) * BANNER_SCALE;
const HEART_SLOT_Y = -8 * BANNER_SCALE;
const HEART_HIDDEN_Y = -74 * BANNER_SCALE;
const QUESTION_HIDDEN_Y = -275;
const CONTENT_HIDDEN_X = [-700 * BANNER_SCALE, 700 * BANNER_SCALE];

const BANNER_TO_HEARTS_MS = 230;
const BANNER_OUT_MS = 200;

const heartSlotX = (index: number, count: number) =>
  (index - (count - 1) / 2) * HEART_PITCH;

interface Cursor {
  loadedAt: number;
  group: number;
  slot: number;
  revealed: boolean;
  player: number;
  lives: number[];
}

const START: Cursor = {
  loadedAt: 0,
  group: 0,
  slot: 0,
  revealed: false,
  player: 0,
  lives: [0, 0],
};

export function MiLibroFavoritoLogic() {
  const patch = useGameState((s) => s.patch);
  const setPosition = useGameState((s) => s.setPosition);
  const setVisible = useGameState((s) => s.setVisible);
  const { play, playStagger } = useAnimations();
  const session = useGameSession((s) => s.session) as MiLibroSession | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);

  const groups = session?.groups ?? [];
  const players = session?.players ?? [];

  const maxHealth = (side: number) =>
    Math.min(players[side]?.maxHealth ?? 0, MAX_HEART_SLOTS);

  if (cursor.loadedAt !== loadedAt) {
    setCursor({
      ...START,
      loadedAt,
      lives: Array.from({ length: PLAYER_COUNT }, (_, side) =>
        Math.min(players[side]?.maxHealth ?? 0, MAX_HEART_SLOTS),
      ),
    });
  }

  const slots = groups[cursor.group]?.slots ?? [];
  const slot = slots[cursor.slot];
  const text = (cursor.revealed ? slot?.answer : slot?.question) ?? "";

  useEffect(() => {
    patch(QUESTION_TEXT_ID, "text", { text });
  }, [text, patch]);

  useEffect(() => {
    if (!session) return;
    setPosition(QUESTION_FRAME_ID, { x: 0, y: QUESTION_HIDDEN_Y });
    for (let side = 0; side < PLAYER_COUNT; side++) {
      const max = Math.min(
        session.players[side]?.maxHealth ?? 0,
        MAX_HEART_SLOTS,
      );
      patch(NAME_TEXT_IDS[side], "text", {
        text: session.players[side]?.playerName ?? "",
      });
      setPosition(CONTENT_IDS[side], { x: CONTENT_HIDDEN_X[side], y: 0 });
      for (let i = 0; i < MAX_HEART_SLOTS; i++) {
        setVisible(HEART_SLOT_IDS[side][i], i < max);
        setPosition(HEART_SLOT_IDS[side][i], {
          x: heartSlotX(i, max),
          y: HEART_SLOT_Y,
        });
        setPosition(HEART_ROOT_IDS[side][i], { x: 0, y: HEART_HIDDEN_Y });
        setVisible(FULL_HEART_IDS[side][i], true);
        setVisible(BROKEN_HEART_IDS[side][i], false);
      }
    }
  }, [session, loadedAt, patch, setPosition, setVisible]);

  const showSlot = (group: number, index: number) => {
    if (!groups[group]?.slots[index]) return;
    setCursor((c) => ({ ...c, group, slot: index, revealed: false }));
    void play(QUESTION_FRAME_ID, "slide");
  };

  const reveal = (animation: "pop" | "shake", sound: string) => {
    if (!slot) return;
    setCursor((c) => ({ ...c, revealed: true }));
    void play(QUESTION_FRAME_ID, animation);
    playSound(sound);
  };

  const activeRoots = (side: number) =>
    HEART_ROOT_IDS[side].slice(0, maxHealth(side));

  const enterBanner = (side: number) => {
    void play(CONTENT_IDS[side], "bounce");
    window.setTimeout(
      () => void playStagger(activeRoots(side), "bounce", 200),
      BANNER_TO_HEARTS_MS,
    );
  };

  const exitBanner = (side: number) => {
    void play(CONTENT_IDS[side], "slide");
    window.setTimeout(() => {
      for (const rootId of activeRoots(side)) {
        setPosition(rootId, { x: 0, y: HEART_HIDDEN_Y });
      }
    }, BANNER_OUT_MS);
  };

  const selectPlayer = (side: number) => {
    setCursor((c) => ({ ...c, player: side }));
    enterBanner(side);
    exitBanner(1 - side);
  };

  const addLife = () => {
    const side = cursor.player;
    const current = cursor.lives[side] ?? 0;
    if (current >= maxHealth(side)) return;
    setVisible(FULL_HEART_IDS[side][current], true);
    setVisible(BROKEN_HEART_IDS[side][current], false);
    setCursor((c) => ({
      ...c,
      lives: c.lives.map((life, s) => (s === side ? life + 1 : life)),
    }));
  };

  const removeLife = () => {
    const side = cursor.player;
    const index = (cursor.lives[side] ?? 0) - 1;
    if (index < 0) return;
    setCursor((c) => ({
      ...c,
      lives: c.lives.map((life, s) => (s === side ? life - 1 : life)),
    }));
    const rootId = HEART_ROOT_IDS[side][index];
    setVisible(FULL_HEART_IDS[side][index], true);
    setVisible(BROKEN_HEART_IDS[side][index], false);
    void play(rootId, "blink").then(() => {
      setVisible(FULL_HEART_IDS[side][index], false);
      setVisible(BROKEN_HEART_IDS[side][index], true);
      void play(rootId, "blinkSettle");
    });
  };

  useGameKeys({
    onNumber: (value) => showSlot(cursor.group, value),
    onNavigate: (value) => showSlot(value, 0),
    onNext: () => showSlot(cursor.group, cursor.slot + 1),
    onBack: () => showSlot(cursor.group, cursor.slot - 1),
    onInteract: () => void play(QUESTION_FRAME_ID, "bounce"),
    onClear: () => void play(QUESTION_FRAME_ID, "slide"),
    onShowAnswer: () => reveal("pop", SOUNDS.correct),
    onMarkError: () => reveal("shake", SOUNDS.incorrect),
    onArrowLeft: () => selectPlayer(0),
    onArrowRight: () => selectPlayer(1),
    onArrowUp: () => {
      enterBanner(0);
      enterBanner(1);
    },
    onArrowDown: () => {
      exitBanner(0);
      exitBanner(1);
    },
    onPlus: addLife,
    onMinus: removeLife,
  });

  return null;
}
