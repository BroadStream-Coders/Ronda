"use client";

import { GroupRow, ImagePicker, rowFieldClass, setSlotImage } from "@/collector/kit";
import { Input } from "@/components/ui/input";
import type { RowData } from "./schema";

interface RowProps {
  index: number;
  data: RowData;
  onChange: (updates: Partial<RowData>) => void;
  onRemove: () => void;
}

export function Row({ index, data, onChange, onRemove }: RowProps) {
  return (
    <GroupRow
      index={index}
      onRemove={onRemove}
      align="start"
      removeLabel="Eliminar evento"
    >
      <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-2">
        <Input
          value={data.date}
          onChange={(e) => onChange({ date: e.target.value })}
          placeholder="Fecha"
          className={`${rowFieldClass} h-8 border-transparent bg-background`}
        />
        <Input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Título del evento"
          className={`${rowFieldClass} h-8 border-transparent bg-background`}
        />
        <ImagePicker
          value={data.image.url}
          onChange={(file, url) =>
            onChange({ image: setSlotImage(data.image, file, url) })
          }
          crop={{ x: 1, y: 1 }}
          placeholder="Imagen"
        />
      </div>
    </GroupRow>
  );
}
