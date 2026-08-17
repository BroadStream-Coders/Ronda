"use client";

import { GroupRow, rowFieldClass } from "@/collector/kit";
import { Input } from "@/components/ui/input";

interface RowProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

const LONG_WORD = 15;

export function Row({ index, value, onChange, onRemove }: RowProps) {
  const long = value.length > LONG_WORD;

  return (
    <GroupRow index={index} onRemove={onRemove} removeLabel="Eliminar palabra">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Palabra"
          className={`${rowFieldClass} pr-9`}
        />
        {long && (
          <span
            title={`${value.length} letras`}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs tabular-nums text-accent"
          >
            {value.length}
          </span>
        )}
      </div>
    </GroupRow>
  );
}
