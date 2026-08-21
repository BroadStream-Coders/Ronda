"use client";

import { motion } from "motion/react";

import { poppins } from "@/game/fonts/poppins";
import { DESIGN_HEIGHT, type LayerPart } from "@/game/kit";

export interface SentencePart extends LayerPart {
  type: "sentence";
  words: string[];
  order: number[];
  solved: boolean;
  fontSize: number;
}

const tilt = (index: number) => ((index * 37) % 13) - 6;
const drift = (index: number) => ((index * 53) % 9) - 4;

const SPRING = { type: "spring" as const, stiffness: 220, damping: 26 };

const CHIP = {
  loose: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)",
    border: "0.05em solid rgba(255,255,255,0.34)",
    boxShadow: "0 0.16em 0.55em rgba(0,0,0,0.45)",
  },
  solved: {
    background: "linear-gradient(180deg, #7b6bff 0%, #3524b8 100%)",
    border: "0.05em solid rgba(255,255,255,0.45)",
    boxShadow: "0 0.14em 0.6em rgba(90,66,255,0.6)",
  },
} as const;

export function SentenceView({ part }: { part: SentencePart }) {
  const { words, order, solved, fontSize } = part;
  const sequence = solved ? words.map((_, index) => index) : order;
  const chip = solved ? CHIP.solved : CHIP.loose;

  return (
    <div
      className={`${poppins.className} flex h-full w-full flex-col items-center justify-center`}
      style={{ fontSize: `${(fontSize / DESIGN_HEIGHT) * 100}cqh` }}
    >
      <div
        className="flex flex-wrap items-center justify-center"
        style={{ gap: solved ? "0.24em 0.3em" : "0.45em 0.55em" }}
      >
        {sequence.map((wordIndex) => (
          <motion.span
            key={wordIndex}
            layout
            transition={SPRING}
            animate={{
              rotate: solved ? 0 : tilt(wordIndex),
              y: solved ? 0 : `${drift(wordIndex)}%`,
            }}
            className="inline-block whitespace-nowrap leading-none text-white"
            style={{
              padding: "0.3em 0.62em 0.36em",
              borderRadius: "0.28em",
              ...chip,
            }}
          >
            {words[wordIndex]}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={false}
        animate={{ scaleX: solved ? 1 : 0, opacity: solved ? 1 : 0 }}
        transition={SPRING}
        style={{
          marginTop: "0.7em",
          width: "62%",
          height: "0.08em",
          borderRadius: "0.04em",
          background:
            "linear-gradient(90deg, rgba(255,197,61,0) 0%, #ffc53d 50%, rgba(255,197,61,0) 100%)",
        }}
      />
    </div>
  );
}
