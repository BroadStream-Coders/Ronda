"use client";

import { Check, Plus, Trash2 } from "lucide-react";

import { Panel, PanelCount, QuickLoad } from "@/collector/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLS, ROWS, type Word } from "./schema";

interface ListProps {
  words: Word[];
  maxWords: number;
  selectedWordId: string | null;
  onSelectWord: (id: string) => void;
  onAddWord: () => void;
  onRemoveWord: (id: string) => void;
  onUpdateWord: (id: string, field: "text" | "direction", value: string) => void;
  onQuickLoad: (matrix: string[][]) => void;
}

export function List({
  words,
  maxWords,
  selectedWordId,
  onSelectWord,
  onAddWord,
  onRemoveWord,
  onUpdateWord,
  onQuickLoad,
}: ListProps) {
  return (
    <Panel
      title="Palabras"
      aside={<PanelCount value={words.length} max={maxWords} />}
      className="w-full shrink-0 lg:w-[320px]"
    >
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {words.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            Todavía no hay palabras. Agrégalas a mano o pega el tablero desde tu
            planilla.
          </p>
        ) : (
          <div className="space-y-1.5">
            {words.map((word, index) => {
              const selected = selectedWordId === word.id;
              const placed = Boolean(word.sequence);

              return (
                <div
                  key={word.id}
                  className={`group/word flex items-center gap-1.5 rounded-lg border p-1.5 transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:border-primary/40"
                  }`}
                >
                  <button
                    onClick={() => onSelectWord(word.id)}
                    title={
                      selected
                        ? "Ubicando en el tablero"
                        : "Seleccionar para ubicar en el tablero"
                    }
                    className={`relative flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-medium tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-secondary"
                    }`}
                  >
                    {index + 1}
                    {placed && !selected && (
                      <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-2.5" />
                      </span>
                    )}
                  </button>

                  <Input
                    value={word.text}
                    onChange={(e) => onUpdateWord(word.id, "text", e.target.value)}
                    placeholder="PALABRA"
                    className="min-w-0 flex-1 uppercase"
                  />

                  <select
                    value={word.direction}
                    aria-label="Dirección"
                    onChange={(e) => onUpdateWord(word.id, "direction", e.target.value)}
                    className="h-8 shrink-0 rounded-md border border-input bg-background px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="H">H</option>
                    <option value="V">V</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemoveWord(word.id)}
                    aria-label={`Eliminar palabra ${index + 1}`}
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/word:opacity-100 focus-visible:opacity-100 hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-muted/30 p-3">
        <Button
          variant="outline"
          onClick={onAddWord}
          disabled={words.length >= maxWords}
          className="h-9 w-full gap-2"
        >
          <Plus />
          Agregar palabra
        </Button>
        <QuickLoad
          onLoad={(matrix) => {
            if (matrix.length > 0) onQuickLoad(matrix);
          }}
          placeholder={`Pega el tablero completo de ${COLS} × ${ROWS}, una letra por celda…`}
        />
      </div>
    </Panel>
  );
}
