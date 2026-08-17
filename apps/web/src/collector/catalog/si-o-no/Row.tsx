"use client";

import { GroupRow, rowFieldClass } from "@/collector/kit";
import { Textarea } from "@/components/ui/textarea";
import type { RowData } from "./schema";

interface RowProps {
  index: number;
  data: RowData;
  onChange: (updates: Partial<RowData>) => void;
  onRemove: () => void;
}

function choiceClass(selected: boolean) {
  return `flex h-8 flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors ${
    selected
      ? "bg-primary text-primary-foreground"
      : "bg-background text-muted-foreground hover:text-foreground"
  }`;
}

export function Row({ index, data, onChange, onRemove }: RowProps) {
  const toggle = (value: "Si" | "No") =>
    onChange({ correctAnswer: data.correctAnswer === value ? null : value });

  return (
    <GroupRow
      index={index}
      onRemove={onRemove}
      align="start"
      removeLabel="Eliminar pregunta"
    >
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2">
        <Textarea
          value={data.question}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Pregunta"
          className={`${rowFieldClass} h-16 min-h-16 resize-none border-transparent bg-background py-2`}
        />

        <div className="flex gap-1.5 rounded-lg bg-muted p-1">
          <button onClick={() => toggle("Si")} className={choiceClass(data.correctAnswer === "Si")}>
            Sí
          </button>
          <button onClick={() => toggle("No")} className={choiceClass(data.correctAnswer === "No")}>
            No
          </button>
        </div>
      </div>
    </GroupRow>
  );
}
