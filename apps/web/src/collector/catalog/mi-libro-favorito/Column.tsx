"use client";

import {
  AddRowButton,
  GroupColumn,
  GroupFooter,
  QuickLoad,
  RowsContainer,
} from "@/collector/kit";
import type { QA } from "./schema";
import { Row } from "./Row";

const MAX_CAPACITY = 30;

interface ColumnProps {
  index: number;
  items: QA[];
  onItemChange: (
    itemIndex: number,
    field: "question" | "answer",
    value: string,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (itemIndex: number) => void;
  onRemoveColumn: () => void;
  onQuickLoad: (data: string[][]) => void;
}

export function Column({
  index,
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
      width="w-[650px]"
    >
      <RowsContainer>
        {items.map((item, itemIdx) => (
          <Row
            key={itemIdx}
            index={itemIdx}
            question={item.question}
            answer={item.answer}
            onQuestionChange={(val) => onItemChange(itemIdx, "question", val)}
            onAnswerChange={(val) => onItemChange(itemIdx, "answer", val)}
            onRemove={() => onRemoveItem(itemIdx)}
          />
        ))}
      </RowsContainer>

      <AddRowButton onClick={handleAddItem} label="Agregar pregunta" />

      <GroupFooter>
        <QuickLoad
          onLoad={onQuickLoad}
          placeholder="Pegar: pregunta (col 1) + respuesta (col 2)…"
        />
      </GroupFooter>
    </GroupColumn>
  );
}
