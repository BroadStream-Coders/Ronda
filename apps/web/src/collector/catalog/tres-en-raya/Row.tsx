"use client";

import { RowCard } from "@/collector/kit";
import { Input } from "@/components/ui/input";
import type { RowData } from "./schema";

interface RowProps {
  index: number;
  data: RowData;
  onChange: (updates: Partial<RowData>) => void;
}

export function Row({ index, data, onChange }: RowProps) {
  return (
    <RowCard index={index + 1}>
      <div className="flex min-w-0 flex-col justify-center gap-1.5">
        <Input
          value={data.question}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Pregunta"
          className="text-xs"
        />
        <Input
          value={data.answer}
          onChange={(e) => onChange({ answer: e.target.value })}
          placeholder="Respuesta"
          className="text-xs"
        />
      </div>
    </RowCard>
  );
}
