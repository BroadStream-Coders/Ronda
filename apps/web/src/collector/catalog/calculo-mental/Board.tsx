"use client";

import { Trash2 } from "lucide-react";

import { RowCard } from "@/collector/kit";
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
    <RowCard
      index={index}
      action={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemoveBoard}
          aria-label={`Eliminar tablero ${index}`}
          className="h-8 w-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      }
    >
      <div className="flex min-w-0 flex-1 gap-1.5">
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
    </RowCard>
  );
}
