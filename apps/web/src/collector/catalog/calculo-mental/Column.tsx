"use client";

import {
  AddRowButton,
  GroupColumn,
  GroupFooter,
  QuickLoad,
  RowsContainer,
} from "@/collector/kit";
import type { BoardData } from "./schema";
import { Board } from "./Board";

const MAX_CAPACITY = 30;

interface ColumnProps {
  index: number;
  boards: BoardData[];
  onSlotChange: (
    boardIdx: number,
    slotIdx: number,
    field: "question" | "answer",
    value: string,
  ) => void;
  onAddBoard: () => void;
  onRemoveBoard: (boardIdx: number) => void;
  onRemoveColumn: () => void;
  onQuickLoad: (data: string[][]) => void;
}

export function Column({
  index,
  boards,
  onSlotChange,
  onAddBoard,
  onRemoveBoard,
  onRemoveColumn,
  onQuickLoad,
}: ColumnProps) {
  const handleAddBoard = () => {
    if (boards.length >= MAX_CAPACITY) return;
    onAddBoard();
  };

  return (
    <GroupColumn
      index={index}
      onRemove={onRemoveColumn}
      currentCapacity={boards.length}
      maxCapacity={MAX_CAPACITY}
      width="w-[700px]"
    >
      <RowsContainer>
        {boards.map((board, boardIdx) => (
          <Board
            key={boardIdx}
            index={boardIdx}
            slots={board.slots}
            onSlotChange={(slotIdx, field, val) =>
              onSlotChange(boardIdx, slotIdx, field, val)
            }
            onRemoveBoard={() => onRemoveBoard(boardIdx)}
          />
        ))}
      </RowsContainer>

      <AddRowButton onClick={handleAddBoard} label="Añadir tablero" />

      <GroupFooter>
        <QuickLoad
          onLoad={onQuickLoad}
          placeholder="Pegar Q/A desde Excel (fila de enunciados, fila de respuestas)…"
        />
      </GroupFooter>
    </GroupColumn>
  );
}
