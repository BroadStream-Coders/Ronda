"use client";

import { Trash2 } from "lucide-react";

import {
  AddRowButton,
  GroupColumn,
  GroupFooter,
  QuickLoad,
  RowCard,
  RowsContainer,
  getColumnData,
} from "@/collector/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MAX_LETTERS,
  MAX_WORDS,
  toLetters,
  wordProblem,
  type RoundState,
} from "./schema";

interface ColumnProps {
  index: number;
  round: RoundState;
  onChange: (round: RoundState) => void;
  onRemove: () => void;
}

export function Column({ index, round, onChange, onRemove }: ColumnProps) {
  const setWords = (words: string[]) => onChange({ ...round, words });

  const handleQuickLoad = (matrix: string[][]) => {
    const words = getColumnData(matrix, 0)
      .map(toLetters)
      .filter((w) => w !== "")
      .slice(0, MAX_WORDS);
    if (words.length > 0) setWords(words);
  };

  return (
    <GroupColumn
      index={index}
      onRemove={onRemove}
      currentCapacity={round.words.length}
      maxCapacity={MAX_WORDS}
    >
      <RowsContainer>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
            Letras
          </label>
          <Input
            value={round.letters}
            onChange={(e) =>
              onChange({ ...round, letters: toLetters(e.target.value) })
            }
            placeholder="Palabra base, p. ej. ROMA"
            aria-invalid={round.letters.length > MAX_LETTERS || undefined}
          />
          {round.letters !== "" && (
            <div className="flex flex-wrap gap-1 px-1">
              {[...round.letters].map((letter, i) => (
                <span
                  key={i}
                  className="flex size-7 items-center justify-center rounded border border-border bg-muted/30 font-mono text-xs font-semibold"
                >
                  {letter}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
            Palabras ocultas
          </label>
          {round.words.map((word, wordIndex) => {
            const problem = wordProblem(word, round.letters);
            return (
              <RowCard
                key={wordIndex}
                index={wordIndex + 1}
                inline
                action={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setWords(round.words.filter((_, i) => i !== wordIndex))
                    }
                    aria-label={`Eliminar palabra ${wordIndex + 1}`}
                    className="h-8 w-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                }
              >
                <div className="min-w-0 space-y-1">
                  <Input
                    value={word}
                    onChange={(e) =>
                      setWords(
                        round.words.map((w, i) =>
                          i === wordIndex ? toLetters(e.target.value) : w,
                        ),
                      )
                    }
                    placeholder="Palabra"
                    aria-invalid={problem ? true : undefined}
                  />
                  {problem && (
                    <p className="px-1 text-[11px] text-destructive">{problem}</p>
                  )}
                </div>
              </RowCard>
            );
          })}
        </div>
      </RowsContainer>

      {round.words.length < MAX_WORDS && (
        <AddRowButton
          onClick={() => setWords([...round.words, ""])}
          label="Agregar palabra"
        />
      )}

      <GroupFooter>
        <QuickLoad
          onLoad={handleQuickLoad}
          placeholder="Pegar palabras (una por línea)…"
        />
      </GroupFooter>
    </GroupColumn>
  );
}
