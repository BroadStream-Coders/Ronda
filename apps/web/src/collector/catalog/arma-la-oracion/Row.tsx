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

const LONG_SENTENCE = 8;

export function Row({ index, value, onChange, onRemove }: RowProps) {
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <RowCard
      index={index + 1}
      inline
      action={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Eliminar oración ${index + 1}`}
          className="h-8 w-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      }
    >
      <div className="relative min-w-0">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Oración"
          className="pr-9"
        />
        {words > LONG_SENTENCE && (
          <span
            title={`${words} palabras`}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs tabular-nums text-accent"
          >
            {words}
          </span>
        )}
      </div>
    </RowCard>
  );
}
