"use client";

import {
  GroupColumn,
  GroupFooter,
  QuickLoad,
  RowsContainer,
  TitleInput,
} from "@/collector/kit";
import type { RowData } from "./schema";
import { Row } from "./Row";

interface ColumnProps {
  index: number;
  title: string;
  onTitleChange: (value: string) => void;
  items: RowData[];
  onItemChange: (itemIndex: number, updates: Partial<RowData>) => void;
  onRemoveColumn: () => void;
  onQuickLoad: (data: string[][]) => void;
}

export function Column({
  index,
  title,
  onTitleChange,
  items,
  onItemChange,
  onRemoveColumn,
  onQuickLoad,
}: ColumnProps) {
  return (
    <GroupColumn index={index} onRemove={onRemoveColumn}>
      <TitleInput
        value={title}
        onChange={onTitleChange}
        placeholder="Pregunta / Título..."
      />

      <RowsContainer>
        {items.map((item, itemIdx) => (
          <Row
            key={item.id || itemIdx}
            index={itemIdx}
            data={item}
            onChange={(updates) => onItemChange(itemIdx, updates)}
          />
        ))}
      </RowsContainer>

      <GroupFooter>
        <QuickLoad
          onLoad={onQuickLoad}
          placeholder="Pegar fecha (col 1) + título (col 2)…"
        />
      </GroupFooter>
    </GroupColumn>
  );
}
