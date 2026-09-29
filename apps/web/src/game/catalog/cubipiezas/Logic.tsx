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
  useLayerClick,
  type Layer,
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
import layout from "./layout.json";
import { meta } from "./meta";

const PHOTO_ID = "photo";
const SPARKLES_ID = "sparkles";
const FRESH: CardStatus[] = Array(CARD_COUNT).fill("letter");
const UNASSIGNED: (number | null)[] = Array(CARD_COUNT).fill(null);
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
  question: number;
  current: number;
  cards: CardStatus[];
  assigned: (number | null)[];
  peek: boolean;
}

const START: Cursor = {
  loadedAt: 0,
  round: 0,
  question: 0,
  current: -1,
  cards: FRESH,
  assigned: UNASSIGNED,
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
      const assigned = cursor.assigned[index];
      const question = assigned === null ? undefined : round?.questions[assigned];
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
  }, [round, cursor.cards, cursor.assigned, cursor.peek, patch, setVisible]);

  const setStatus = (
    gen: number,
    index: number,
    status: CardStatus,
    question?: number,
  ) => {
    if (generation.current !== gen) return false;
    setCursor((c) => ({
      ...c,
      cards: c.cards.map((current, i) => (i === index ? status : current)),
      assigned:
        question === undefined
          ? c.assigned
          : c.assigned.map((current, i) => (i === index ? question : current)),
    }));
    return true;
  };

  const runOn = (index: number, job: (gen: number) => Promise<void>) => {
    if (!round || locked.current || index < 0 || inFlight.current.has(index)) {
      return;
    }
    inFlight.current.add(index);
    job(generation.current).finally(() => inFlight.current.delete(index));
  };

  const onCard = (job: (index: number, gen: number) => Promise<void>) => {
    const index = cursor.current;
    runOn(index, (gen) => job(index, gen));
  };

  const turn = async (
    index: number,
    gen: number,
    status: CardStatus,
    question?: number,
  ) => {
    await play(cardId(index), "flipHide");
    if (!setStatus(gen, index, status, question)) return;
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
      setCursor((c) => ({
        ...c,
        round: index,
        question: 0,
        current: -1,
        cards: FRESH,
        assigned: UNASSIGNED,
        peek: false,
      }));
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

  const onCardClick = (layerId: string) => {
    const match = /^card-(\d+)$/.exec(layerId);
    if (!match) return;
    const index = Number(match[1]);
    const status = cursor.cards[index];
    if (status === undefined || status === "hidden") return;
    const question = cursor.question;
    runOn(index, async (gen) => {
      setCursor((c) => ({ ...c, current: index }));
      if (status === "letter") await turn(index, gen, "question", question);
      else await turn(index, gen, "letter");
    });
  };

  useLayerClick(layout as Layer[], onCardClick);

  useGameKeys({
    onNavigate: (value) => {
      const index = value - 1;
      if (value === 0 || index >= rounds.length || locked.current) return;
      enterRound(index);
    },
    onNumber: (value) => {
      if (!round || value >= round.questions.length) return;
      setCursor((c) => ({ ...c, question: value }));
    },
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
