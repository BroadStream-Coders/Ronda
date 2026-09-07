"use client";

import { Check, Trash2 } from "lucide-react";

import { RowCard } from "@/collector/kit";
import { Button } from "@/components/ui/button";
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
              : "border-border bg-card text-muted-foreground/50 hover:text-foreground"
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
          className="text-xs"
        />
      </div>
    );
  };

  return (
    <RowCard
      index={index + 1}
      action={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Eliminar pregunta ${index + 1}`}
          className="h-8 w-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      }
    >
      <div className="flex min-w-0 flex-col gap-2">
        <Textarea
          value={data.question}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Pregunta"
          className="h-16 min-h-16 resize-none py-2 text-xs"
        />
        {option("L", data.answerL, "Primera opción")}
        {option("R", data.answerR, "Segunda opción")}
      </div>
    </RowCard>
  );
}
