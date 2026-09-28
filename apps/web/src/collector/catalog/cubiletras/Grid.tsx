"use client";

import { Dices } from "lucide-react";

import { Panel, PanelHint } from "@/collector/kit";
import { Button } from "@/components/ui/button";
import { COLS, ROWS } from "./schema";

export interface PreviewCell {
  value: string;
  isValid: boolean;
}

interface GridProps {
  words: string[][];
  filler: string[][] | null;
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  onCellLeave: () => void;
  onGenerateFiller: () => void;
  previewCells: Record<string, PreviewCell>;
  isPlacementMode: boolean;
}

export function Grid({
  words,
  filler,
  onCellClick,
  onCellHover,
  onCellLeave,
  onGenerateFiller,
  previewCells,
  isPlacementMode,
}: GridProps) {
  return (
    <Panel
      title="Tablero"
      aside={
        <div className="flex items-center gap-2">
          {isPlacementMode && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              <span className="size-1.5 rounded-full bg-accent" />
              Elige dónde colocarla
            </span>
          )}
          <Button variant="outline" size="sm" onClick={onGenerateFiller} className="gap-1.5">
            <Dices />
            {filler ? "Regenerar relleno" : "Generar relleno"}
          </Button>
        </div>
      }
      className={`min-w-0 flex-1 ${isPlacementMode ? "border-accent" : ""}`}
    >
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/30 p-4">
        <div
          className="grid w-full max-w-[640px] gap-1"
          style={{
            aspectRatio: `${COLS} / ${ROWS}`,
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          }}
          onMouseLeave={onCellLeave}
        >
          {words.map((row, rowIndex) =>
            row.map((letter, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const preview = previewCells[cellKey];
              const fillLetter = filler?.[rowIndex]?.[colIndex] ?? "";

              let content = letter || fillLetter;
              let cellClass = "border-border bg-card text-muted-foreground/60 hover:bg-muted";

              if (preview) {
                content = preview.value;
                cellClass = preview.isValid
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-destructive bg-destructive/15 text-destructive";
              } else if (letter) {
                cellClass = "border-primary/30 bg-primary/10 text-primary";
              } else if (isPlacementMode) {
                cellClass =
                  "border-border bg-card text-muted-foreground/60 hover:border-accent hover:bg-accent/10";
              }

              return (
                <button
                  key={cellKey}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  onMouseEnter={() => onCellHover(rowIndex, colIndex)}
                  className={`flex size-full items-center justify-center rounded-md border text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:text-base ${cellClass}`}
                >
                  {content}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <PanelHint>
        Las letras de las palabras se ven resaltadas; el resto es relleno. El
        relleno se guarda con la ronda y solo cambia si lo regeneras.
      </PanelHint>
    </Panel>
  );
}
