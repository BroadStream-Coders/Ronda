"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RowProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export function Row({ index, value, onChange, onRemove }: RowProps) {
  const charCount = value.length;

  const getCountColor = () => {
    if (charCount === 0) return "text-muted-foreground/40";
    if (charCount > 20) return "text-primary font-bold";
    if (charCount > 15) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="flex items-center gap-2 group">
      <div className="flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-mono text-muted-foreground/50 select-none">
        {index + 1}
      </div>

      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe aquí..."
          className="h-9 pr-9 rounded-lg bg-background border-border text-sm placeholder:text-muted-foreground/40 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30"
        />
        <div
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono ${getCountColor()}`}
        >
          {charCount > 0 ? charCount : ""}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="size-7 shrink-0 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
