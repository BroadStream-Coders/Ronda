"use client";

import { useEffect, useRef, useState } from "react";

import {
  playSound,
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import { clicks } from "./clicks";
import type { TresEnRayaSession } from "./session";

const CARD_COUNT = 9;
const CARDS = Array.from({ length: CARD_COUNT }, (_, index) => index);

const cardId = (i: number) => `card-${i}`;
const backId = (i: number) => `card-${i}-back`;
const frontId = (i: number) => `card-${i}-front`;
const numberId = (i: number) => `card-${i}-number`;
const crossId = (i: number) => `card-${i}-cross`;
const circleId = (i: number) => `card-${i}-circle`;
const textId = (i: number) => `card-${i}-text`;

// El orden es el de los hijos de "Lines" en Unity: filas 0-2, columnas 3-5,
// diagonales 6 (0-4-8) y 7 (2-4-6). La validación indexa por esta posición.
const LINE_IDS = [
  "line-row-0",
  "line-row-1",
  "line-row-2",
  "line-column-0",
  "line-column-1",
  "line-column-2",
  "line-diagonal-0",
  "line-diagonal-1",
];

type Mark = "normal" | "cross" | "circle";

interface Cursor {
  loadedAt: number;
  group: number;
}

const START: Cursor = { loadedAt: 0, group: 0 };

export function TresEnRayaLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const { play } = useAnimations();

  const session = useGameSession((s) => s.session) as TresEnRayaSession | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);
  const [selected, setSelected] = useState(0);
  const [team, setTeam] = useState<Exclude<Mark, "normal">>("cross");

  if (cursor.loadedAt !== loadedAt) {
    setCursor({ ...START, loadedAt });
    setSelected(0);
  }

  const groups = session?.groups ?? [];
  const slots = groups[cursor.group]?.slots ?? [];

  const marksRef = useRef<Mark[]>(CARDS.map(() => "normal"));
  const assignedRef = useRef<(number | null)[]>(CARDS.map(() => null));
  const faceUpRef = useRef<boolean[]>(CARDS.map(() => false));
  const flippingRef = useRef(new Set<number>());
  const currentRef = useRef(-1);

  const showMark = (i: number, mark: Mark) => {
    setVisible(numberId(i), mark === "normal");
    setVisible(crossId(i), mark === "cross");
    setVisible(circleId(i), mark === "circle");
  };

  const { group } = cursor;

  useEffect(() => {
    for (const i of CARDS) {
      marksRef.current[i] = "normal";
      assignedRef.current[i] = null;
      faceUpRef.current[i] = false;
      setVisible(numberId(i), true);
      setVisible(crossId(i), false);
      setVisible(circleId(i), false);
      setVisible(backId(i), true);
      setVisible(frontId(i), false);
      patch(textId(i), "text", { text: "" });
    }
    for (const id of LINE_IDS) setVisible(id, false);
    currentRef.current = -1;
  }, [group, loadedAt, setVisible, patch]);

  const assign = (i: number, slotIndex: number) => {
    const slot = slots[slotIndex];
    if (!slot) return;
    assignedRef.current[i] = slotIndex;
    patch(textId(i), "text", { text: slot.question });
  };

  // Fiel a Unity: cualquier SetStatus pone la respuesta en el texto, incluso al
  // volver a "normal".
  const mark = (i: number, value: Mark) => {
    marksRef.current[i] = value;
    showMark(i, value);
    const assigned = assignedRef.current[i];
    const slot = assigned === null ? undefined : slots[assigned];
    if (slot) patch(textId(i), "text", { text: slot.answer });
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

  // El clic solo asigna la pregunta y toma el foco cuando la carta estaba boca
  // abajo; si ya estaba arriba, únicamente la voltea. Es lo que hace `OnClick`.
  const onCardClick = (layerId: string) => {
    const i = Number(layerId.slice("card-".length));
    if (!Number.isInteger(i) || i < 0 || i >= CARD_COUNT) return;
    const up = faceUpRef.current[i];
    if (!up) {
      currentRef.current = i;
      assign(i, selected);
    }
    void flipCard(i, !up);
  };

  useEffect(() => {
    clicks.listen(onCardClick);
    return () => clicks.listen(null);
  });

  const goToGroup = (index: number) => {
    if (index < 0 || index >= groups.length) return;
    setCursor((c) => ({ ...c, group: index }));
    setSelected(0);
  };

  const markCurrent = (value: Mark) => {
    const i = currentRef.current;
    if (i >= 0) mark(i, value);
  };

  const flipCurrentDown = () => {
    const i = currentRef.current;
    if (i >= 0) void flipCard(i, false);
  };

  const validate = () => {
    for (const id of LINE_IDS) setVisible(id, false);
    const marks = marksRef.current;
    const line = (a: number, b: number, c: number) =>
      marks[a] !== "normal" && marks[a] === marks[b] && marks[b] === marks[c];

    // Unity usa ActivateOnlyChildAt, así que solo queda encendida la última
    // línea que coincide, no todas.
    let winner = -1;
    for (let row = 0; row < 3; row++) {
      const start = row * 3;
      if (line(start, start + 1, start + 2)) winner = row;
    }
    for (let column = 0; column < 3; column++) {
      if (line(column, column + 3, column + 6)) winner = column + 3;
    }
    if (line(0, 4, 8)) winner = 6;
    if (line(2, 4, 6)) winner = 7;
    if (winner >= 0) setVisible(LINE_IDS[winner], true);
  };

  const revealAll = (withAnswer: boolean) => {
    for (const i of CARDS) {
      if (i >= slots.length) break;
      assign(i, i);
      void flipCard(i, true);
      if (withAnswer) mark(i, "cross");
    }
  };

  useGameKeys({
    onNavigate: (value) => {
      if (value === 0) return;
      goToGroup(value - 1);
    },
    onNumber: (value) => {
      if (value >= slots.length) return;
      setSelected(value);
    },
    onArrowRight: () => setTeam("cross"),
    onArrowLeft: () => setTeam("circle"),
    onShowAnswer: () => {
      markCurrent(team);
      playSound(SOUNDS.correct);
    },
    onMarkError: () => {
      playSound(SOUNDS.incorrect);
      flipCurrentDown();
    },
    onBack: () => flipCurrentDown(),
    onClear: () => markCurrent("normal"),
    onValidate: () => validate(),
    onInteractAll: () => revealAll(false),
    onShowAnswerAll: () => revealAll(true),
  });

  return null;
}
