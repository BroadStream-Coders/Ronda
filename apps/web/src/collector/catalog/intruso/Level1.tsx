"use client";

import type { Dispatch, SetStateAction } from "react";
import { AlertCircle, X } from "lucide-react";

import {
  AddRowButton,
  GroupColumn,
  GroupFooter,
  GroupsContainer,
  QuickLoad,
  RowsContainer,
} from "@/collector/kit";
import { Card } from "./Card";
import {
  MAX_OPTIONS,
  TEXT_ROUND_CROP,
  createEmptyTextRound,
  type TextRoundState,
} from "./schema";

interface Level1Props {
  rounds: TextRoundState[];
  setRounds: Dispatch<SetStateAction<TextRoundState[]>>;
}

export function Level1({ rounds, setRounds }: Level1Props) {
  const updateRound = (
    roundId: string,
    updater: (round: TextRoundState) => TextRoundState,
  ) =>
    setRounds((prev) => prev.map((r) => (r.id === roundId ? updater(r) : r)));

  const addRound = () => setRounds((prev) => [...prev, createEmptyTextRound()]);

  const removeRound = (roundId: string) =>
    setRounds((prev) => {
      const round = prev.find((r) => r.id === roundId);
      if (round?.image.url) URL.revokeObjectURL(round.image.url);
      return prev.filter((r) => r.id !== roundId);
    });

  const setImage = (roundId: string, file: File, url: string) =>
    updateRound(roundId, (round) => {
      if (round.image.url && round.image.url !== url) {
        URL.revokeObjectURL(round.image.url);
      }
      return { ...round, image: { ...round.image, file, url } };
    });

  const setOptions = (roundId: string, options: TextRoundState["options"]) =>
    updateRound(roundId, (round) => ({ ...round, options }));

  const handleQuickLoad = (roundId: string, matrix: string[][]) => {
    const lines: string[] = [];
    for (const row of matrix) {
      const line = row[0]?.trim() ?? "";
      if (line !== "") {
        lines.push(line);
        if (lines.length === MAX_OPTIONS) break;
      }
    }
    if (lines.length === 0) return;
    setOptions(
      roundId,
      lines.map((text) => ({ text, isIntruso: false })),
    );
  };

  return (
    <GroupsContainer onAddGroup={addRound} addLabel="Agregar ronda">
      {rounds.map((round, roundIndex) => (
        <GroupColumn
          key={round.id}
          index={roundIndex + 1}
          onRemove={() => removeRound(round.id)}
          currentCapacity={round.options.length}
          maxCapacity={MAX_OPTIONS}
        >
          <RowsContainer>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
                Imagen única
              </label>
              <div className="px-2">
                <Card
                  imageUrl={round.image.url}
                  isIntruso={false}
                  crop={TEXT_ROUND_CROP}
                  onImageChange={(file, url) => setImage(round.id, file, url)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
                Opciones ({round.options.length}/{MAX_OPTIONS})
              </label>

              <div className="space-y-2">
                {round.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`flex items-center gap-2 rounded-md border transition-all ${
                      option.isIntruso
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                        : "border-border bg-background/50"
                    }`}
                  >
                    <button
                      onClick={() =>
                        setOptions(
                          round.id,
                          round.options.map((o, i) => ({
                            ...o,
                            isIntruso: i === optionIndex ? !o.isIntruso : false,
                          })),
                        )
                      }
                      title="Marcar como intruso"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-l-md border-r transition-colors ${
                        option.isIntruso
                          ? "bg-primary text-primary-foreground border-primary/20"
                          : "bg-muted/30 text-muted-foreground/30 hover:text-primary hover:bg-primary/10"
                      }`}
                    >
                      <AlertCircle className="h-4 w-4" />
                    </button>

                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        setOptions(
                          round.id,
                          round.options.map((o, i) =>
                            i === optionIndex ? { ...o, text: e.target.value } : o,
                          ),
                        )
                      }
                      placeholder={`Opción ${optionIndex + 1}...`}
                      className="h-9 flex-1 bg-transparent px-2 text-xs focus:outline-hidden placeholder:text-muted-foreground/30"
                    />

                    {round.options.length > 1 && (
                      <button
                        onClick={() =>
                          setOptions(
                            round.id,
                            round.options.filter((_, i) => i !== optionIndex),
                          )
                        }
                        className="mr-2 text-muted-foreground/30 hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </RowsContainer>

          <AddRowButton
            onClick={() => {
              if (round.options.length >= MAX_OPTIONS) return;
              setOptions(round.id, [
                ...round.options,
                { text: "", isIntruso: false },
              ]);
            }}
            label="Agregar opción"
          />

          <GroupFooter>
            <QuickLoad
              onLoad={(matrix) => handleQuickLoad(round.id, matrix)}
              placeholder="Pegar opciones (una por línea)…"
            />
          </GroupFooter>
        </GroupColumn>
      ))}
    </GroupsContainer>
  );
}
