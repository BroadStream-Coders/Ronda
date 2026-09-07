"use client";

import { Input } from "@/components/ui/input";

interface SlotProps {
  question: string;
  answer: string;
  onQuestionChange: (val: string) => void;
  onAnswerChange: (val: string) => void;
  label?: string;
}

export function Slot({
  question,
  answer,
  onQuestionChange,
  onAnswerChange,
  label,
}: SlotProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[60px] flex-1">
      {label && (
        <span className="text-[10px] font-bold text-muted-foreground/60 text-center uppercase tracking-tighter mb-0.5">
          {label}
        </span>
      )}
      <div className="space-y-1">
        <Input
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="Q..."
          className="h-7 px-1.5 text-center text-xs"
        />
        <Input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="A..."
          className="h-7 px-1.5 text-center text-xs font-bold"
        />
      </div>
    </div>
  );
}
