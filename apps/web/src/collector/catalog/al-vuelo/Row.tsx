"use client";

import { Trash2 } from "lucide-react";

import { RowCard } from "@/collector/kit";
import { Button } from "@/components/ui/button";
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
      : "bg-card text-muted-foreground hover:text-foreground"
  }`;
}

export function Row({ index, data, onChange, onRemove }: RowProps) {
  const toggle = (value: "Si" | "No") =>
    onChange({ correctAnswer: data.correctAnswer === value ? null : value });

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

        <div className="flex gap-1.5 rounded-lg bg-muted p-1">
          <button onClick={() => toggle("Si")} className={choiceClass(data.correctAnswer === "Si")}>
            Sí
          </button>
          <button onClick={() => toggle("No")} className={choiceClass(data.correctAnswer === "No")}>
            No
          </button>
        </div>
      </div>
    </RowCard>
  );
}
