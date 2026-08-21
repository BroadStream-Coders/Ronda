"use client";

import { GroupRow, rowFieldClass } from "@/collector/kit";
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
    <GroupRow index={index} onRemove={onRemove} removeLabel="Eliminar palabra">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Palabra"
          className={`${rowFieldClass} pr-9`}
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
    </GroupRow>
  );
}
