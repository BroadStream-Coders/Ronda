"use client";

import { GroupRow, rowFieldClass } from "@/collector/kit";
import { Input } from "@/components/ui/input";

interface RowProps {
  index: number;
  question: string;
  answer: string;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onRemove: () => void;
}

export function Row({
  index,
  question,
  answer,
  onQuestionChange,
  onAnswerChange,
  onRemove,
}: RowProps) {
  return (
    <GroupRow
      index={index}
      onRemove={onRemove}
      align="start"
      removeLabel="Eliminar pregunta"
    >
      <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-2">
        <Input
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="Pregunta"
          className={`${rowFieldClass} h-8 border-transparent bg-background`}
        />
        <Input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Respuesta"
          className={`${rowFieldClass} h-8 border-transparent bg-background`}
        />
      </div>
    </GroupRow>
  );
}
