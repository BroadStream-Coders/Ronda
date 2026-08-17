"use client";

import { Check } from "lucide-react";

import { GroupRow, rowFieldClass } from "@/collector/kit";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RowData } from "./schema";

interface RowProps {
  index: number;
  data: RowData;
  onChange: (updates: Partial<RowData>) => void;
  onRemove: () => void;
}

export function Row({ index, data, onChange, onRemove }: RowProps) {
  const option = (side: "L" | "R", value: string, placeholder: string) => {
    const correct = data.correctAnswer === side;
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange({ correctAnswer: side })}
          aria-label={`Marcar "${placeholder}" como correcta`}
          aria-pressed={correct}
          className={`flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
            correct
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground/50 hover:text-foreground"
          }`}
        >
          <Check className="size-3.5" />
        </button>
        <Input
          value={value}
          onChange={(e) =>
            onChange(side === "L" ? { answerL: e.target.value } : { answerR: e.target.value })
          }
          placeholder={placeholder}
          className={`${rowFieldClass} h-8 border-transparent bg-background`}
        />
      </div>
    );
  };

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
        {option("L", data.answerL, "Primera opción")}
        {option("R", data.answerR, "Segunda opción")}
      </div>
    </GroupRow>
  );
}
