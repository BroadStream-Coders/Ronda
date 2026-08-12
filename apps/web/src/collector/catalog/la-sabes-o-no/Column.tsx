"use client";

import {
  AddRowButton,
  GroupColumn,
  GroupFooter,
  QuickLoad,
  RowsContainer,
  TitleInput,
} from "@/collector/kit";
import type { RowData } from "./schema";
import { Row } from "./Row";

const MAX_CAPACITY = 30;

interface ColumnProps {
  index: number;
  title: string;
  onTitleChange: (value: string) => void;
  rows: RowData[];
  onAddRow: () => void;
  onRemoveColumn: () => void;
  onUpdateRow: (rowIndex: number, updates: Partial<RowData>) => void;
  onRemoveRow: (rowIndex: number) => void;
  onQuickLoad: (data: string[][]) => void;
}

export function Column({
  index,
  title,
  onTitleChange,
  rows,
  onAddRow,
  onRemoveColumn,
  onUpdateRow,
  onRemoveRow,
  onQuickLoad,
}: ColumnProps) {
  const handleAddRow = () => {
    if (rows.length >= MAX_CAPACITY) return;
    onAddRow();
  };

  return (
    <GroupColumn
      index={index}
      onRemove={onRemoveColumn}
      currentCapacity={rows.length}
      maxCapacity={MAX_CAPACITY}
    >
      <TitleInput
        value={title}
        onChange={onTitleChange}
        placeholder="Nombre del grupo..."
      />

      <RowsContainer>
        {rows.map((row, rowIndex) => (
          <Row
            key={row.id}
            index={rowIndex}
            data={row}
            onChange={(updates) => onUpdateRow(rowIndex, updates)}
            onRemove={() => onRemoveRow(rowIndex)}
          />
        ))}
      </RowsContainer>

      <AddRowButton onClick={handleAddRow} label="Agregar fila" />

      <GroupFooter>
        <QuickLoad
          onLoad={onQuickLoad}
          placeholder="Pegar: pregunta (col 1) + dos respuestas (col 2 y 3)…"
        />
      </GroupFooter>
    </GroupColumn>
  );
}
