"use client";

import { Trash2 } from "lucide-react";

import { RowCard } from "@/collector/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RowProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

const LONG_WORD = 12;

export function Row({ index, value, onChange, onRemove }: RowProps) {
  const letters = value.replace(/\s+/g, "").length;

  return (
    <RowCard
      index={index + 1}
      action={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Eliminar palabra ${index + 1}`}
          className="h-8 w-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      }
    >
      <div className="relative flex min-w-0 flex-col justify-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Palabra"
          className="pr-9"
        />
        {letters > LONG_WORD && (
          <span
            title={`${letters} letras`}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs tabular-nums text-accent"
          >
            {letters}
          </span>
        )}
      </div>
    </RowCard>
  );
}
