"use client";

import {
  GroupColumn,
  GroupFooter,
  QuickLoad,
  RowsContainer,
} from "@/collector/kit";
import { Row } from "./Row";
import type { RowData } from "./schema";

interface ColumnProps {
  index: number;
  rows: RowData[];
  onUpdateRow: (rowIndex: number, updates: Partial<RowData>) => void;
  onRemoveColumn: () => void;
  onQuickLoad: (data: string[][]) => void;
}

export function Column({
  index,
  rows,
  onUpdateRow,
  onRemoveColumn,
  onQuickLoad,
}: ColumnProps) {
  return (
    <GroupColumn index={index} onRemove={onRemoveColumn}>
      <RowsContainer>
        {rows.map((row, rowIndex) => (
          <Row
            key={row.id}
            index={rowIndex}
            data={row}
            onChange={(updates) => onUpdateRow(rowIndex, updates)}
          />
        ))}
      </RowsContainer>

      <GroupFooter>
        <QuickLoad
          onLoad={onQuickLoad}
          placeholder="Pegar pregunta y respuesta (2 columnas)..."
        />
      </GroupFooter>
    </GroupColumn>
  );
}
