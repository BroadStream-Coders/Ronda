"use client";

import { motion } from "motion/react";

import { geniusTechno } from "@/game/fonts/genius-techno";
import { DESIGN_HEIGHT, type LayerPart } from "@/game/kit";

export interface BlanksPart extends LayerPart {
  type: "blanks";
  letters: string[];
  order: number[];
  revealed: number;
  fontSize: number;
}

const FLIGHT = { type: "spring" as const, stiffness: 260, damping: 26 };

const CHIP = {
  base: {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: "1em",
    height: "1.16em",
    borderRadius: "0.16em",
    lineHeight: 1,
  },
  pool: {
    background: "linear-gradient(180deg, #ffffff 0%, #f2f5fd 100%)",
    border: "0.035em solid rgba(30,45,95,0.16)",
    boxShadow: "0 0.08em 0.22em rgba(30,45,95,0.18)",
    color: "#1d2542",
  },
  placed: {
    background: "linear-gradient(180deg, #ffffff 0%, #e9fbf7 100%)",
    border: "0.035em solid rgba(13,148,136,0.55)",
    boxShadow: "0 0.08em 0.24em rgba(13,148,136,0.28)",
    color: "#0d5c56",
  },
} as const;

export function BlanksView({ part }: { part: BlanksPart }) {
  const { letters, order, revealed, fontSize } = part;
  const pool = order.filter((index) => index >= revealed);
  const complete = letters.length > 0 && revealed >= letters.length;

  return (
    <div
      className={`${geniusTechno.className} flex h-full w-full flex-col items-center justify-center uppercase`}
      style={{
        fontSize: `${(fontSize / DESIGN_HEIGHT) * 100}cqh`,
        gap: "0.55em",
      }}
    >
      <div
        className="flex flex-wrap items-end justify-center"
        style={{ gap: "0.12em 0.18em" }}
      >
        {letters.map((letter, index) => (
          <span
            key={index}
            className="inline-flex flex-col items-center justify-end"
            style={{ width: "1em" }}
          >
            <span
              className="flex w-full items-end justify-center"
              style={{ height: "1.16em" }}
            >
              {index < revealed && (
                <motion.span
                  layoutId={`letra-${index}`}
                  transition={FLIGHT}
                  style={{ ...CHIP.base, ...CHIP.placed }}
                >
                  {letter}
                </motion.span>
              )}
            </span>

            <motion.span
              initial={false}
              animate={{ opacity: index < revealed ? 1 : 0.55 }}
              className="w-full"
              style={{
                marginTop: "0.12em",
                height: "0.08em",
                borderRadius: "0.04em",
                background: complete
                  ? "linear-gradient(90deg, #ffb02e 0%, #ff9500 100%)"
                  : index < revealed
                    ? "#0d9488"
                    : "rgba(30,45,95,0.35)",
              }}
            />
          </span>
        ))}
      </div>

      <div
        className="flex flex-wrap items-center justify-center"
        style={{ gap: "0.16em 0.2em", minHeight: "1.16em" }}
      >
        {pool.map((index) => (
          <motion.span
            key={index}
            layoutId={`letra-${index}`}
            transition={FLIGHT}
            style={{ ...CHIP.base, ...CHIP.pool }}
          >
            {letters[index]}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
