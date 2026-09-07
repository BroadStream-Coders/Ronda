"use client";

import { Trash2 } from "lucide-react";

import { RowCard } from "@/collector/kit";
import { Button } from "@/components/ui/button";
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
      <div className="flex min-w-0 flex-col justify-center gap-1.5">
        <Input
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="Pregunta"
          className="text-xs"
        />
        <Input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Respuesta"
          className="text-xs"
        />
      </div>
    </RowCard>
  );
}
