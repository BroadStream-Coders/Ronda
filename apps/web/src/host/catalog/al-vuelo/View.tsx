"use client";

import { useState } from "react";

import { isData, type Data } from "@/collector/catalog/al-vuelo/schema";
import {
  HostMessage,
  HostTable,
  RoundTabs,
  type HostColumn,
  type HostViewProps,
} from "@/host/kit";

type Question = Data["groups"][number]["questions"][number];

const questionColumn: HostColumn<Question> = {
  header: "Pregunta",
  cell: (row) => row.question?.trim() || "—",
  className: "text-xl font-medium",
};

const answerColumn: HostColumn<Question> = {
  header: "Respuesta",
  width: "w-40",
  align: "center",
  cell: (row) =>
    typeof row.answer === "boolean" ? (
      <span className="text-2xl font-semibold text-primary">
        {row.answer ? "Sí" : "No"}
      </span>
    ) : (
      <span className="text-base text-muted-foreground">Sin marcar</span>
    ),
};

const columns = [questionColumn, answerColumn];

export function AlVueloView({ session }: HostViewProps) {
  const [round, setRound] = useState(0);

  if (!isData(session)) {
    return (
      <HostMessage
        title="Los datos no son de Al Vuelo"
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
