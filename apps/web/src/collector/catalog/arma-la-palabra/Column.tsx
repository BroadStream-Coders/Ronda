"use client";

import {
  AddRowButton,
  GroupColumn,
  GroupFooter,
  QuickLoad,
  RowsContainer,
} from "@/collector/kit";
import { Row } from "./Row";

const MAX_CAPACITY = 30;

interface ColumnProps {
  index: number;
  words: string[];
  onWordChange: (wordIndex: number, value: string) => void;
  onAddWord: () => void;
  onRemoveWord: (wordIndex: number) => void;
  onRemoveColumn: () => void;
  onQuickLoad: (data: string[][]) => void;
}

export function Column({
  index,
  words,
  onWordChange,
  onAddWord,
  onRemoveWord,
  onRemoveColumn,
  onQuickLoad,
}: ColumnProps) {
  const handleAddWord = () => {
    if (words.length >= MAX_CAPACITY) return;
    onAddWord();
  };

  return (
    <GroupColumn
      index={index}
      onRemove={onRemoveColumn}
      currentCapacity={words.length}
      maxCapacity={MAX_CAPACITY}
    >
      <RowsContainer>
        {words.map((word, wordIndex) => (
          <Row
            key={wordIndex}
            index={wordIndex}
            value={word}
            onChange={(val) => onWordChange(wordIndex, val)}
            onRemove={() => onRemoveWord(wordIndex)}
          />
        ))}
      </RowsContainer>

      <AddRowButton onClick={handleAddWord} label="Agregar palabra" />

      <GroupFooter>
        <QuickLoad onLoad={onQuickLoad} />
      </GroupFooter>
    </GroupColumn>
  );
}
