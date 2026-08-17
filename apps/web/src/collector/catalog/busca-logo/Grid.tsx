"use client";

import { Star } from "lucide-react";

import { Panel } from "@/collector/kit";
import type { BoardSize } from "./schema";

interface GridProps {
  logoPositions: number[];
  boardSize: BoardSize;
  onCellClick: (index: number) => void;
}

export function Grid({ logoPositions, boardSize, onCellClick }: GridProps) {
  const [cols, rows] = boardSize.split("x").map(Number);
  const cells = Array.from({ length: cols * rows }, (_, i) => i);

  const gridColsClass =
    cols === 4 ? "grid-cols-4" : cols === 5 ? "grid-cols-5" : "grid-cols-6";

  return (
    <Panel
      title="Tablero"
      aside={
        <span className="text-xs text-muted-foreground">
          {cols} x {rows}
        </span>
      }
      className="min-w-0 flex-1"
    >
      <div className="min-h-0 flex-1 overflow-auto bg-muted/30 p-4">
        <div
          className={`mx-auto grid w-full max-w-3xl gap-2 sm:gap-3 ${gridColsClass}`}
        >
          {cells.map((cell) => {
            const hasLogo = logoPositions.includes(cell);
            return (
              <button
                key={cell}
                type="button"
                onClick={() => onCellClick(cell)}
                aria-pressed={hasLogo}
                className={`relative flex aspect-square items-center justify-center rounded-xl border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                  hasLogo
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <span className="absolute top-2 left-2 text-xs tabular-nums text-muted-foreground/60">
                  {cell + 1}
                </span>
                {hasLogo && <Star className="size-7 fill-primary sm:size-8" />}
              </button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
