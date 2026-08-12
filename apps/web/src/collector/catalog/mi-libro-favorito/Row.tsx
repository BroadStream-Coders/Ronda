"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-2 group p-3 rounded-lg border border-border bg-background/50 transition-colors hover:bg-background">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-mono text-muted-foreground/50 select-none">
          {index + 1}
        </div>
        <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider flex-1">
          Pregunta {index + 1}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-6 w-6 shrink-0 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="Escribe la pregunta aquí..."
          className="h-9 rounded-lg bg-background border-border text-xs placeholder:text-muted-foreground/40 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30"
        />
        <Input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Escribe la respuesta aquí..."
          className="h-9 rounded-lg bg-background/50 border-border text-xs placeholder:text-muted-foreground/40 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30"
        />
      </div>
    </div>
  );
}
