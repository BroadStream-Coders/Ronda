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
  sentences: string[];
  onSentenceChange: (sentenceIndex: number, value: string) => void;
  onAddSentence: () => void;
  onRemoveSentence: (sentenceIndex: number) => void;
  onRemoveColumn: () => void;
  onQuickLoad: (data: string[][]) => void;
}

export function Column({
  index,
  sentences,
  onSentenceChange,
  onAddSentence,
  onRemoveSentence,
  onRemoveColumn,
  onQuickLoad,
}: ColumnProps) {
  const handleAddSentence = () => {
    if (sentences.length >= MAX_CAPACITY) return;
    onAddSentence();
  };

  return (
    <GroupColumn
      index={index}
      onRemove={onRemoveColumn}
      currentCapacity={sentences.length}
      maxCapacity={MAX_CAPACITY}
      width="w-[650px]"
    >
      <RowsContainer>
        {sentences.map((sentence, sentenceIndex) => (
          <Row
            key={sentenceIndex}
            index={sentenceIndex}
            value={sentence}
            onChange={(val) => onSentenceChange(sentenceIndex, val)}
            onRemove={() => onRemoveSentence(sentenceIndex)}
          />
        ))}
      </RowsContainer>

      <AddRowButton onClick={handleAddSentence} label="Agregar oración" />

      <GroupFooter>
        <QuickLoad onLoad={onQuickLoad} />
      </GroupFooter>
    </GroupColumn>
  );
}
