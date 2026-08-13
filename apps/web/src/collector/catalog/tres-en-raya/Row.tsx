"use client";

import { Input } from "@/components/ui/input";
import type { RowData } from "./schema";

interface RowProps {
  index: number;
  data: RowData;
  onChange: (updates: Partial<RowData>) => void;
}

const inputClass =
  "h-8 w-full border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary";

export function Row({ index, data, onChange }: RowProps) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/30">
      <div className="grid grid-cols-[2rem_1fr] items-start gap-2 w-full">
        <div className="flex h-8 w-full items-center justify-center rounded border border-border bg-muted/30 text-xs font-mono font-medium text-muted-foreground">
          {index + 1}
        </div>

        <Input
          value={data.question}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Pregunta..."
          className={inputClass}
        />

        <Input
          value={data.answer}
          onChange={(e) => onChange({ answer: e.target.value })}
          placeholder="Respuesta..."
          className={`col-start-2 ${inputClass}`}
        />
      </div>
    </div>
  );
}
