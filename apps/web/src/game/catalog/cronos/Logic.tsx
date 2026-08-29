"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  findPart,
  playSound,
  shuffledOrder,
  stopSound,
  useGameKeys,
  useGameSession,
  useGameState,
  type Layer,
} from "@/game/kit";
import { COUNTDOWN_SECONDS, SOUNDS } from "./assets";
import layout from "./layout.json";
import { placement } from "./placement";
import type { CronosSession } from "./session";

const SLOT_COUNT = 5;
const SLOTS = Array.from({ length: SLOT_COUNT }, (_, index) => index);

const TITLE_ID = "title";
const TIMER_ID = "timer";

const cardId = (i: number) => `card-${i}`;
const photoId = (i: number) => `card-${i}-photo`;
const cardTitleId = (i: number) => `card-${i}-title`;
const dateId = (i: number) => `zone-${i}-date`;
const pointId = (i: number, mark: string) => `zone-${i}-point-${mark}`;

interface TimerPart {
  type: "timer";
  duration: number;
}

const design = layout as Layer[];

const DURATION = findPart<TimerPart>(design, TIMER_ID, "timer")?.duration ?? 30;

const HOME = new Map(
  design
    .filter((layer) => /^card-\d+$/.test(layer.id))
    .map((layer) => [layer.id, layer.rect.position]),
);

interface Cursor {
  loadedAt: number;
  round: number;
  revealed: boolean;
}

const START: Cursor = { loadedAt: 0, round: 0, revealed: false };

export function CronosLogic() {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const setPosition = useGameState((s) => s.setPosition);

  const session = useGameSession((s) => s.session) as CronosSession | null;
  const images = useGameSession((s) => s.images);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [cursor, setCursor] = useState<Cursor>(START);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [deadline, setDeadline] = useState<number | null>(null);

  if (cursor.loadedAt !== loadedAt) {
    setCursor({ ...START, loadedAt });
    setTimeLeft(DURATION);
    setDeadline(null);
  }

  const groups = session?.groups ?? [];
  const group = groups[cursor.round];
  const itemCount = group?.items.length ?? 0;

  const order = useMemo(
    () => shuffledOrder(itemCount, loadedAt + cursor.round),
    [itemCount, loadedAt, cursor.round],
  );

  useEffect(() => {
    patch(TITLE_ID, "text", { text: group?.title ?? "" });
    for (const i of SLOTS) {
      patch(dateId(i), "text", { text: group?.items[i]?.date ?? "" });
      const item = group?.items[order[i]];
      patch(photoId(i), "image", {
        src: item ? (images[item.imagePath] ?? "") : "",
      });
      patch(cardTitleId(i), "text", { text: item?.title ?? "" });
    }
  }, [group, order, images, patch]);

  const { revealed, round } = cursor;

  useEffect(() => {
    placement.clear();
    for (const i of SLOTS) {
      setVisible(pointId(i, "normal"), true);
      setVisible(pointId(i, "correct"), false);
      setVisible(pointId(i, "incorrect"), false);
      setVisible(cardId(i), revealed && i < itemCount);
      const home = HOME.get(cardId(i));
      if (home) setPosition(cardId(i), home);
    }
  }, [round, loadedAt, revealed, itemCount, setVisible, setPosition]);

  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  });

  useEffect(() => {
    if (deadline === null) return;

    const enterCountdown = (left: number) =>
      playSound(SOUNDS.countdown, COUNTDOWN_SECONDS - left);

    let previous = timeLeftRef.current;
    let finished = false;
    if (previous > 0 && previous <= COUNTDOWN_SECONDS) enterCountdown(previous);

    const id = window.setInterval(() => {
      const left = Math.max(0, (deadline - performance.now()) / 1000);
      if (previous > COUNTDOWN_SECONDS && left <= COUNTDOWN_SECONDS && left > 0) {
        enterCountdown(left);
      }
      previous = left;
      setTimeLeft(left);
      if (left === 0) {
        finished = true;
        setDeadline(null);
      }
    }, 100);

    return () => {
      window.clearInterval(id);
      if (!finished) stopSound(SOUNDS.countdown);
    };
  }, [deadline]);

  useEffect(() => {
    patch(TIMER_ID, "text", { text: String(Math.ceil(timeLeft)) });
  }, [timeLeft, patch]);

  const stopTimer = () => {
    setDeadline(null);
    setTimeLeft(DURATION);
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= groups.length) return;
    setCursor((c) => ({ ...c, round: index, revealed: false }));
    stopTimer();
  };

  useGameKeys({
    onNumber: goTo,
    onNavigate: goTo,
    onNext: () => goTo(round + 1),
    onBack: () => goTo(round - 1),
    onStart: () => {
      setCursor((c) => ({ ...c, revealed: true }));
      setTimeLeft(DURATION);
      setDeadline(performance.now() + DURATION * 1000);
    },
    onTimer: () => {
      if (deadline !== null) {
        setDeadline(null);
        return;
      }
      const left = timeLeft > 0 ? timeLeft : DURATION;
      setTimeLeft(left);
      setDeadline(performance.now() + left * 1000);
    },
    onValidate: () => {
      if (!revealed || itemCount === 0) return;
      let allCorrect = true;
      for (let zone = 0; zone < itemCount; zone++) {
        const holder = placement.cardOf(zone);
        const card = holder ? Number(holder.split("-")[1]) : -1;
        const correct = card >= 0 && order[card] === zone;
        if (!correct) allCorrect = false;
        setVisible(pointId(zone, "normal"), false);
        setVisible(pointId(zone, "correct"), correct);
        setVisible(pointId(zone, "incorrect"), !correct);
      }
      playSound(allCorrect ? SOUNDS.correct : SOUNDS.incorrect);
    },
    onClear: () => {
      setCursor((c) => ({ ...c, revealed: false }));
      stopTimer();
    },
  });

  return null;
}
