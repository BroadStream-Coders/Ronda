"use client";

import { useState } from "react";

import {
  isData,
  type BoardData,
} from "@/collector/catalog/calculo-mental/schema";
import {
  HostMessage,
  HostTable,
  RoundTabs,
  type HostColumn,
  type HostViewProps,
} from "@/host/kit";

const SLOT_LABELS = ["A", "B", "C", "D"];

const boardColumn: HostColumn<BoardData> = {
  header: "Tablero",
  width: "w-20",
  align: "center",
  cell: (_board, index) => index,
  className: "bg-muted/60 text-lg font-semibold tabular-nums text-muted-foreground",
};

const slotColumn = (slot: number): HostColumn<BoardData> => ({
  header: SLOT_LABELS[slot],
  width: "w-1/4",
  align: "center",
  cell: (board) => {
    const { question, answer } = board.slots?.[slot] ?? {};
    return (
      <span className="flex flex-col gap-1">
        <span className="text-left text-base text-muted-foreground">
          {question?.trim() || "—"}
        </span>
        <span className="text-right text-xl font-semibold tabular-nums text-primary">
          {answer?.trim() || "—"}
        </span>
      </span>
    );
  },
});

const columns = [boardColumn, ...SLOT_LABELS.map((_, slot) => slotColumn(slot))];

export function CalculoMentalView({ session }: HostViewProps) {
  const [round, setRound] = useState(0);

  if (!isData(session)) {
    return (
      <HostMessage
        title="Los datos no son de Cálculo Mental"
        detail="El archivo guardado en el colector no tiene el formato de este juego."
      />
    );
  }

  const groups = session.groups;
  const boards = groups[round]?.boards ?? [];

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        {boards.length === 0 ? (
          <HostMessage
            title="Este grupo está vacío"
            detail="No hay tableros cargados para este grupo."
          />
        ) : (
          <HostTable rows={boards} columns={columns} numbered={false} />
        )}
      </div>

      <RoundTabs
        rounds={groups.map((_, index) => `Grupo ${index + 1}`)}
        value={round}
        onChange={setRound}
      />
    </>
  );
}
