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

const MAX_CAPACITY = 5;

interface ColumnProps {
  index: number;
  title: string;
  onTitleChange: (value: string) => void;
  items: RowData[];
  onItemChange: (itemIndex: number, updates: Partial<RowData>) => void;
  onAddItem: () => void;
  onRemoveItem: (itemIndex: number) => void;
  onRemoveColumn: () => void;
  onQuickLoad: (data: string[][]) => void;
}

export function Column({
  index,
  title,
  onTitleChange,
  items,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onRemoveColumn,
  onQuickLoad,
}: ColumnProps) {
  const handleAddItem = () => {
    if (items.length >= MAX_CAPACITY) return;
    onAddItem();
  };

  return (
    <GroupColumn
      index={index}
      onRemove={onRemoveColumn}
      currentCapacity={items.length}
      maxCapacity={MAX_CAPACITY}
    >
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
            onRemove={() => onRemoveItem(itemIdx)}
          />
        ))}
      </RowsContainer>

      <AddRowButton onClick={handleAddItem} label="Agregar evento" />

      <GroupFooter>
        <QuickLoad
          onLoad={onQuickLoad}
          placeholder="Pegar fecha (col 1) + título (col 2)…"
        />
      </GroupFooter>
    </GroupColumn>
  );
}
