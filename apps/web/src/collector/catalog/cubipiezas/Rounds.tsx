"use client";

import type { Dispatch, SetStateAction } from "react";

import {
  GroupColumn,
  GroupFooter,
  GroupsContainer,
  ImagePicker,
  QuickLoad,
  RowCard,
  RowsContainer,
  releaseSlots,
  setSlotImage,
} from "@/collector/kit";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  IMAGE_CROP,
  QUESTIONS_PER_ROUND,
  createEmptyRound,
  type QuestionState,
  type RoundState,
} from "./schema";

interface RoundsProps {
  rounds: RoundState[];
  setRounds: Dispatch<SetStateAction<RoundState[]>>;
}

export function Rounds({ rounds, setRounds }: RoundsProps) {
  const updateRound = (
    roundId: string,
    updater: (round: RoundState) => RoundState,
  ) =>
    setRounds((prev) => prev.map((r) => (r.id === roundId ? updater(r) : r)));

  const addRound = () => setRounds((prev) => [...prev, createEmptyRound()]);

  const removeRound = (roundId: string) => {
    releaseSlots([rounds.find((r) => r.id === roundId)?.image]);
    setRounds((prev) => prev.filter((r) => r.id !== roundId));
  };

  const setImage = (roundId: string, file: File, url: string) =>
    updateRound(roundId, (round) => ({
      ...round,
      image: setSlotImage(round.image, file, url),
    }));

  const setQuestion = (
    roundId: string,
    questionIndex: number,
    updates: Partial<QuestionState>,
  ) =>
    updateRound(roundId, (round) => ({
      ...round,
      questions: round.questions.map((q, i) =>
        i === questionIndex ? { ...q, ...updates } : q,
      ),
    }));

  const handleQuickLoad = (roundId: string, matrix: string[][]) => {
    const rows = matrix
      .map((row) => ({
        question: row[0]?.trim() ?? "",
        answer: row[1]?.trim() ?? "",
      }))
      .filter((row) => row.question !== "" || row.answer !== "")
      .slice(0, QUESTIONS_PER_ROUND);
    if (rows.length === 0) return;
    updateRound(roundId, (round) => ({
      ...round,
      questions: round.questions.map((q, i) => rows[i] ?? q),
    }));
  };

  return (
    <GroupsContainer onAddGroup={addRound} addLabel="Agregar ronda">
      {rounds.map((round, roundIndex) => (
        <GroupColumn
          key={round.id}
          index={roundIndex + 1}
          onRemove={() => removeRound(round.id)}
        >
          <RowsContainer>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
                Imagen
              </label>
              <div className="px-2">
                <ImagePicker
                  value={round.image.url}
                  onChange={(file, url) => setImage(round.id, file, url)}
                  crop={IMAGE_CROP}
                  placeholder="Imagen"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
                Preguntas
              </label>
              <div className="space-y-2">
                {round.questions.map((q, questionIndex) => (
                  <RowCard key={questionIndex} index={questionIndex + 1}>
                    <div className="flex min-w-0 flex-col gap-2">
                      <Textarea
                        value={q.question}
                        onChange={(e) =>
                          setQuestion(round.id, questionIndex, {
                            question: e.target.value,
                          })
                        }
                        placeholder="Pregunta"
                        className="h-16 min-h-16 resize-none py-2 text-xs"
                      />
                      <Input
                        value={q.answer}
                        onChange={(e) =>
                          setQuestion(round.id, questionIndex, {
                            answer: e.target.value,
                          })
                        }
                        placeholder="Respuesta"
                        className="text-xs"
                      />
                    </div>
                  </RowCard>
                ))}
              </div>
            </div>
          </RowsContainer>

          <GroupFooter>
            <QuickLoad
              onLoad={(matrix) => handleQuickLoad(round.id, matrix)}
              placeholder="Pegar dos columnas: pregunta y respuesta…"
            />
          </GroupFooter>
        </GroupColumn>
      ))}
    </GroupsContainer>
  );
}
