"use client";

import { useState } from "react";

import { isData } from "@/collector/catalog/deletreo/schema";
import {
  HostMessage,
  HostSwitch,
  HostTable,
  RoundTabs,
  type HostColumn,
  type HostViewProps,
} from "@/host/kit";

const MODES = ["Palabra", "Con deletreo"];

const segmenter = new Intl.Segmenter("es", { granularity: "grapheme" });

function splitLetters(word: string): string[] {
  return [...segmenter.segment(word.trim())].map((piece) => piece.segment);
}

const wordColumn: HostColumn<string> = {
  header: "Palabra",
  cell: (word) => word.trim() || "—",
  className: "text-2xl font-semibold first-letter:uppercase",
};

const spellingColumn: HostColumn<string> = {
  header: "Deletreo",
  width: "w-2/5",
  cell: (word) => {
    const letters = splitLetters(word);
    return (
      <span className="flex items-baseline justify-between gap-4">
        <span className="text-xl font-medium tracking-[0.35em] uppercase">
          {letters.join("")}
        </span>
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {letters.length}
        </span>
      </span>
    );
  },
};

export function DeletreoView({ session }: HostViewProps) {
  const [round, setRound] = useState(0);
  const [mode, setMode] = useState(0);

  if (!isData(session)) {
    return (
      <HostMessage
        title="Los datos no son de Deletreo"
        detail="El archivo guardado en el colector no tiene el formato de este juego."
      />
    );
  }

  const groups = session.groups;
  const words = groups[round]?.words ?? [];

  return (
    <>
      <HostSwitch
        label="Vista"
        options={MODES}
        value={mode}
        onChange={setMode}
      />

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        {words.length === 0 ? (
          <HostMessage
            title="Esta ronda está vacía"
            detail="No hay palabras cargadas para esta ronda."
          />
        ) : (
          <HostTable
            rows={words}
            columns={mode === 0 ? [wordColumn] : [wordColumn, spellingColumn]}
          />
        )}
      </div>

      <RoundTabs
        rounds={groups.map((_, index) => `Ronda ${index + 1}`)}
        value={round}
        onChange={setRound}
      />
    </>
  );
}
