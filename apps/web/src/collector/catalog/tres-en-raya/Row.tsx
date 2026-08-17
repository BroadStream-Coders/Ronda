"use client";

import { GroupRow, rowFieldClass } from "@/collector/kit";
import { Input } from "@/components/ui/input";
import type { RowData } from "./schema";

interface RowProps {
  index: number;
  data: RowData;
  onChange: (updates: Partial<RowData>) => void;
}

export function Row({ index, data, onChange }: RowProps) {
  return (
    <GroupRow index={index} align="start">
      <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-2">
        <Input
          value={data.question}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Pregunta"
          className={`${rowFieldClass} h-8 border-transparent bg-background`}
        />
        <Input
          value={data.answer}
          onChange={(e) => onChange({ answer: e.target.value })}
          placeholder="Respuesta"
          className={`${rowFieldClass} h-8 border-transparent bg-background`}
        />
      </div>
    </GroupRow>
  );
}
