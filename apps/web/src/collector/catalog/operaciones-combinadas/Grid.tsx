"use client";

import { Panel, PanelHint } from "@/collector/kit";
import { GRID_SIZE } from "./schema";

export interface PreviewCell {
  value: string;
  isValid: boolean;
}

interface GridProps {
  grid: string[][];
  onCellClick: (row: number, col: number) => void;
  onCellDoubleClick?: (row: number, col: number) => void;
  onCellHover?: (row: number, col: number) => void;
  onCellLeave?: () => void;
  previewCells?: Record<string, PreviewCell>;
  hiddenCells?: Set<string>;
  isPlacementMode?: boolean;
}

export function Grid({
  grid,
  onCellClick,
  onCellDoubleClick,
  onCellHover,
  onCellLeave,
  previewCells = {},
  hiddenCells = new Set(),
  isPlacementMode = false,
}: GridProps) {
  return (
    <Panel
      title="Tablero"
      aside={
        isPlacementMode ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            Elige dónde colocarla
          </span>
        ) : null
      }
      className={`min-w-0 flex-1 ${isPlacementMode ? "border-accent" : ""}`}
    >
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/30 p-4">
        <div
          className="grid aspect-square w-full max-w-[620px] gap-1"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
          onMouseLeave={onCellLeave}
        >
          {grid.map((row, rowIndex) =>
            row.map((cellValue, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const preview = previewCells[cellKey];
              const isHidden = hiddenCells.has(cellKey);

              let content = cellValue;
              let cellClass =
                "border-border bg-card text-foreground hover:bg-muted";

              if (preview) {
                content = preview.value;
                cellClass = preview.isValid
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-destructive bg-destructive/15 text-destructive";
              } else if (cellValue) {
                cellClass = isHidden
                  ? "border-dashed border-primary/50 bg-card text-primary/40"
                  : "border-primary/30 bg-primary/10 text-primary";
              } else if (isPlacementMode) {
                cellClass =
                  "border-border bg-card text-foreground hover:border-accent hover:bg-accent/10";
              }

              return (
                <button
                  key={cellKey}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  onDoubleClick={() => onCellDoubleClick?.(rowIndex, colIndex)}
                  onMouseEnter={() => onCellHover?.(rowIndex, colIndex)}
                  className={`flex size-full items-center justify-center rounded-md border text-sm font-medium tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:text-base ${cellClass}`}
                >
                  {content}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <PanelHint>
        Doble clic sobre un número para ocultarlo a los jugadores. Los números
        ocultos se ven con borde punteado.
      </PanelHint>
    </Panel>
  );
}
