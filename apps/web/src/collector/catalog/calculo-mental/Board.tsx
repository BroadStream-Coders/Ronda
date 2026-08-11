"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SlotData } from "./schema";
import { Slot } from "./Slot";

interface BoardProps {
  index: number;
  slots: SlotData[];
  onSlotChange: (
    slotIndex: number,
    field: "question" | "answer",
    value: string,
  ) => void;
  onRemoveBoard: () => void;
}

export function Board({ index, slots, onSlotChange, onRemoveBoard }: BoardProps) {
  const labels = ["A", "B", "C", "D"];

  return (
    <div className="flex items-start gap-2 group relative pr-8">
      <div className="flex h-14 w-6 shrink-0 items-center justify-center rounded text-[10px] font-mono text-muted-foreground/40 font-bold select-none pt-4">
        {index}
      </div>

      <div className="flex flex-1 gap-1.5">
        {slots.map((slot, slotIdx) => (
          <Slot
            key={slotIdx}
            label={labels[slotIdx]}
            question={slot.question}
            answer={slot.answer}
            onQuestionChange={(val) => onSlotChange(slotIdx, "question", val)}
            onAnswerChange={(val) => onSlotChange(slotIdx, "answer", val)}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemoveBoard}
        className="absolute right-0 top-1/2 -translate-y-1/2 size-7 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
