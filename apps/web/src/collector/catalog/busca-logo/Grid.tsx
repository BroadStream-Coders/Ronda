"use client";

import { Star } from "lucide-react";
import type { BoardSize } from "./schema";

interface GridProps {
  logoPositions: number[];
  boardSize: BoardSize;
  onCellClick: (index: number) => void;
}

export function Grid({ logoPositions, boardSize, onCellClick }: GridProps) {
  const [cols, rows] = boardSize.split("x").map(Number);
  const totalCells = cols * rows;
  const cells = Array.from({ length: totalCells }, (_, i) => i);

  const gridColsClass =
    cols === 4 ? "grid-cols-4" : cols === 5 ? "grid-cols-5" : "grid-cols-6";
  const aspectClass =
    cols === 4 ? "aspect-[4/3]" : cols === 5 ? "aspect-[5/4]" : "aspect-[6/5]";

  return (
    <section className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex-none bg-muted px-4 py-3 border-b border-border h-12 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Tablero</h2>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center p-4 bg-background/50">
        <div
          className={`grid ${gridColsClass} gap-2 md:gap-3 lg:gap-4 p-4 lg:p-8 w-full max-w-4xl ${aspectClass}`}
        >
          {cells.map((cellNum) => {
            const hasLogo = logoPositions.includes(cellNum);
            return (
              <button
                key={`cell-${cellNum}`}
                type="button"
                onClick={() => onCellClick(cellNum)}
                className={`relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 transition-all cursor-pointer select-none shadow-sm ${
                  hasLogo
                    ? "bg-primary/10 border-primary/50 text-primary shadow-primary/20 shadow-md ring-2 ring-primary/20 scale-[0.98]"
                    : "bg-card border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:scale-[1.02]"
                }`}
              >
                <div className="text-xs lg:text-sm font-medium opacity-50 absolute top-2 left-2">
                  {cellNum + 1}
                </div>
                {hasLogo && (
                  <Star className="size-6 lg:size-9 fill-primary text-primary animate-in zoom-in duration-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
