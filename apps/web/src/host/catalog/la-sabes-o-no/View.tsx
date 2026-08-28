"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { isData } from "@/collector/catalog/la-sabes-o-no/schema";
import {
  HostMessage,
  HostTable,
  RoundTabs,
  type HostColumn,
  type HostViewProps,
} from "@/host/kit";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

const questionColumn: HostColumn<Question> = {
  header: "Pregunta",
  cell: (row) => row.question?.trim() || "—",
  className: "text-xl font-medium",
};

const optionColumn = (side: number): HostColumn<Question> => ({
  header: side === 0 ? "Izquierda" : "Derecha",
  width: "w-1/4",
  cell: (row) => {
    const correct = row.correctIndex === side;
    return (
      <span
        className={cn(
          "flex items-center gap-2 text-lg",
          correct ? "font-semibold text-primary" : "text-muted-foreground",
        )}
      >
        <Check className={cn("size-5 shrink-0", !correct && "invisible")} />
        <span className="min-w-0">{row.options?.[side]?.trim() || "—"}</span>
      </span>
    );
  },
});

const columns = [questionColumn, optionColumn(0), optionColumn(1)];

export function LaSabesONoView({ session }: HostViewProps) {
  const [round, setRound] = useState(0);

  if (!isData(session)) {
    return (
      <HostMessage
        title="Los datos no son de La Sabes o No"
        detail="El archivo guardado en el colector no tiene el formato de este juego."
      />
    );
  }

  const groups = session.groups;
  const questions = groups[round]?.questions ?? [];

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        {questions.length === 0 ? (
          <HostMessage
            title="Este grupo está vacío"
            detail="No hay preguntas cargadas para este grupo."
          />
        ) : (
          <HostTable rows={questions} columns={columns} />
        )}
      </div>

      <RoundTabs
        rounds={groups.map(
          (group, index) => group.title?.trim() || `Grupo ${index + 1}`,
        )}
        value={round}
        onChange={setRound}
      />
    </>
  );
}
