"use client";

import { useEffect, useRef, useState } from "react";

import type { Data } from "@/collector/catalog/cubipiezas/schema";
import {
  playSound,
  settingKey,
  useAnimations,
  useGameKeys,
  useGameSession,
  useGameSetting,
  useGameState,
} from "@/game/kit";
import { SOUNDS } from "./assets";
import {
  BLUR_MAX,
  blurFilter,
  blurFor,
  CARD_COUNT,
  CASCADE,
  cardId,
  nextStatus,
  slotId,
  type CardStatus,
} from "./cards";
import { meta } from "./meta";

const PHOTO_ID = "photo";
const SPARKLES_ID = "sparkles";
const FRESH: CardStatus[] = Array(CARD_COUNT).fill("letter");
const CASCADE_STEP_MS = 70;
const REVEAL_STEP_MS = 90;
const SPARKLES_MS = 2500;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const nextFrame = () =>
  new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r())),
  );

interface Cursor {
  loadedAt: number;
  round: number;
  card: number;
  cards: CardStatus[];
  peek: boolean;
}

const START: Cursor = {
  loadedAt: 0,
  round: 0,
  card: 0,
  cards: FRESH,
  peek: false,
};

export function CubipiezasLogic({ programId }: { programId: string }) {
  const patch = useGameState((s) => s.patch);
  const setVisible = useGameState((s) => s.setVisible);
  const { play, playStagger } = useAnimations();

  const session = useGameSession((s) => s.session) as Data | null;
  const images = useGameSession((s) => s.images);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const [setting] = useGameSetting(
    settingKey(programId, meta.id, "blur"),
    String(BLUR_MAX),
  );
  const blurMax = Number(setting) || 0;

  const [cursor, setCursor] = useState<Cursor>(START);
  const generation = useRef(0);
  const inFlight = useRef(new Set<number>());
  const locked = useRef(false);

  if (cursor.loadedAt !== loadedAt) setCursor({ ...START, loadedAt });

  const rounds = session?.rounds ?? [];
  const round = rounds[cursor.round];

  useEffect(() => {
    patch(PHOTO_ID, "image", {
      src: round ? (images[round.imagePath] ?? "") : "",
      filter: blurFilter(blurFor(cursor.cards, blurMax)),
    });
  }, [round, images, cursor.cards, blurMax, patch]);

  useEffect(() => {
    cursor.cards.forEach((status, index) => {
      const id = cardId(index);
      const question = round?.questions[index];
      const covering = status !== "hidden" && !cursor.peek;
      setVisible(slotId(index), covering);
      setVisible(id, covering);
      setVisible(`${id}-letter`, status === "letter");
      setVisible(`${id}-question`, status === "question" || status === "answer");
      setVisible(`${id}-glint`, status === "answer");
      patch(`${id}-question`, "text", {
        text: (status === "answer" ? question?.answer : question?.question) ?? "",
      });
    });
  }, [round, cursor.cards, cursor.peek, patch, setVisible]);

  const setStatus = (gen: number, index: number, status: CardStatus) => {
    if (generation.current !== gen) return false;
    setCursor((c) => ({
      ...c,
      cards: c.cards.map((current, i) => (i === index ? status : current)),
    }));
    return true;
  };

  const onCard = (job: (index: number, gen: number) => Promise<void>) => {
    const index = cursor.card;
    if (!round || locked.current || inFlight.current.has(index)) return;
    inFlight.current.add(index);
    job(index, generation.current).finally(() => inFlight.current.delete(index));
  };

  const turn = async (index: number, gen: number, status: CardStatus) => {
    await play(cardId(index), "flipHide");
    if (!setStatus(gen, index, status)) return;
    await nextFrame();
    await play(cardId(index), "flipShow");
  };

  const lockWhile = async (job: () => Promise<void>) => {
    locked.current = true;
    try {
      await job();
    } finally {
      locked.current = false;
    }
  };

  const enterRound = (index: number) => {
    const gen = ++generation.current;
    void lockWhile(async () => {
      patch(SPARKLES_ID, "sparkles", { enabled: false });
      for (let i = 0; i < CARD_COUNT; i++) {
        setVisible(slotId(i), true);
        setVisible(cardId(i), true);
      }
      await nextFrame();
      await Promise.all(CASCADE.map((i) => play(cardId(i), "flipHide")));
      if (generation.current !== gen) return;
      setCursor((c) => ({ ...c, round: index, card: 0, cards: FRESH, peek: false }));
      await nextFrame();
      await playStagger(CASCADE.map(cardId), "flipShow", CASCADE_STEP_MS);
    });
  };

  const revealAll = () => {
    const gen = ++generation.current;
    const remaining = CASCADE.filter((i) => cursor.cards[i] !== "hidden");
    playSound(SOUNDS.correct);
    void lockWhile(async () => {
      await Promise.all(
        remaining.map(async (i, step) => {
          await delay(step * REVEAL_STEP_MS);
          await play(cardId(i), "flipHide");
          setStatus(gen, i, "hidden");
        }),
      );
      if (generation.current !== gen) return;
      await nextFrame();
      patch(SPARKLES_ID, "sparkles", { enabled: true });
      void delay(SPARKLES_MS).then(() => {
        if (generation.current === gen) {
          patch(SPARKLES_ID, "sparkles", { enabled: false });
        }
      });
      await play(PHOTO_ID, "pop");
    });
  };

  useGameKeys({
    onNavigate: (value) => {
      const index = value - 1;
      if (value === 0 || index >= rounds.length || locked.current) return;
      enterRound(index);
    },
    onNumber: (value) => {
      if (value >= CARD_COUNT) return;
      setCursor((c) => ({ ...c, card: value }));
    },
    onInteract: () =>
      onCard(async (index, gen) => {
        const status = cursor.cards[index];
        const next = nextStatus(status, "interact");
        if (next !== status) await turn(index, gen, next);
      }),
    onShowAnswer: () => {
      if (!round || locked.current) return;
      playSound(SOUNDS.correct);
      onCard(async (index, gen) => {
        const status = cursor.cards[index];
        const next = nextStatus(status, "showAnswer");
        if (next === status || !setStatus(gen, index, next)) return;
        await nextFrame();
        await play(cardId(index), "pop");
      });
    },
    onMarkError: () => {
      if (!round || locked.current) return;
      playSound(SOUNDS.incorrect);
      onCard(async (index, gen) => {
        const status = cursor.cards[index];
        if (status === "hidden") {
          if (!setStatus(gen, index, "letter")) return;
          await nextFrame();
          await play(cardId(index), "shake");
          return;
        }
        await play(cardId(index), "shake");
        if (status !== "letter") await turn(index, gen, "letter");
      });
    },
    onLock: () =>
      onCard(async (index, gen) => {
        if (cursor.cards[index] === "hidden") return;
        await play(cardId(index), "flipHide");
        setStatus(gen, index, "hidden");
      }),
    onRevealAll: () => {
      if (!round || locked.current) return;
      revealAll();
    },
    onPeek: () => {
      if (!round || locked.current) return;
      setCursor((c) => ({ ...c, peek: !c.peek }));
    },
  });

  return null;
}
