"use client";

import { Plus, Trash2 } from "lucide-react";

import { Panel, QuickLoad } from "@/collector/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Clue } from "./schema";

interface CluesProps {
  clues: Clue[];
  wordCount: number;
  onAddClue: () => void;
  onRemoveClue: (id: string) => void;
  onUpdateClue: (id: string, text: string) => void;
  onQuickLoad: (lines: string[]) => void;
}

export function Clues({
  clues,
  wordCount,
  onAddClue,
  onRemoveClue,
  onUpdateClue,
  onQuickLoad,
}: CluesProps) {
  const mismatch = clues.length !== wordCount;

  return (
    <Panel
      title="Enunciados"
      aside={
        <span
          className={`text-xs tabular-nums ${mismatch ? "text-destructive" : "text-muted-foreground"}`}
          title={mismatch ? "Debe haber tantos enunciados como palabras" : undefined}
        >
          {clues.length}/{wordCount}
        </span>
      }
      className="w-full shrink-0 lg:w-[340px]"
    >
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {clues.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            Todavía no hay enunciados. Agrégalos a mano o pega uno por línea, en
            el mismo orden que las palabras.
          </p>
        ) : (
          <div className="space-y-1.5">
            {clues.map((clue, index) => (
              <div
                key={clue.id}
                className="group/clue flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 p-1.5 transition-colors hover:border-primary/40"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-xs font-medium tabular-nums">
                  {index + 1}
                </span>

                <Input
                  value={clue.text}
                  onChange={(e) => onUpdateClue(clue.id, e.target.value)}
                  placeholder="¿Qué animal maúlla?"
                  className="min-w-0 flex-1"
                />

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemoveClue(clue.id)}
                  aria-label={`Eliminar enunciado ${index + 1}`}
                  className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/clue:opacity-100 focus-visible:opacity-100 hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-muted/30 p-3">
        <Button variant="outline" onClick={onAddClue} className="h-9 w-full gap-2">
          <Plus />
          Agregar enunciado
        </Button>
        <QuickLoad
          onLoad={(matrix) => {
            const lines = matrix
              .map((row) => row.filter(Boolean).join(" ").trim())
              .filter(Boolean);
            if (lines.length > 0) onQuickLoad(lines);
          }}
          placeholder="Pega un enunciado por línea, en el mismo orden que las palabras…"
        />
      </div>
    </Panel>
  );
}
