"use client";

import { GroupRow, rowFieldClass } from "@/collector/kit";
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
    <GroupRow index={index} onRemove={onRemove} removeLabel="Eliminar oración">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Oración"
          className={`${rowFieldClass} pr-9`}
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
    </GroupRow>
  );
}
