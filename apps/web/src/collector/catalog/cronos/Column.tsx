"use client";

import {
  GroupColumn,
  GroupFooter,
  QuickImages,
  QuickLoad,
  type QuickImage,
  RowsContainer,
  TitleInput,
} from "@/collector/kit";
import { COLUMN_SIZE, type RowData } from "./schema";
import { Row } from "./Row";

interface ColumnProps {
  index: number;
  title: string;
  onTitleChange: (value: string) => void;
  items: RowData[];
  onItemChange: (itemIndex: number, updates: Partial<RowData>) => void;
  onRemoveColumn: () => void;
  onQuickLoad: (data: string[][]) => void;
  onQuickImages: (images: QuickImage[]) => void;
}

export function Column({
  index,
  title,
  onTitleChange,
  items,
  onItemChange,
  onRemoveColumn,
  onQuickLoad,
  onQuickImages,
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
          label="Planilla"
          placeholder="Pegar fecha (col 1) + título (col 2)…"
          leading={
            <QuickImages
              onLoad={onQuickImages}
              max={COLUMN_SIZE}
              crop={{ x: 1, y: 1 }}
              label="Imágenes"
              className="flex-1"
            />
          }
        />
      </GroupFooter>
    </GroupColumn>
  );
}
