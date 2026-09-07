"use client";

import { ImagePicker, RowCard, setSlotImage } from "@/collector/kit";
import { Input } from "@/components/ui/input";
import type { RowData } from "./schema";

interface RowProps {
  index: number;
  data: RowData;
  onChange: (updates: Partial<RowData>) => void;
}

export function Row({ index, data, onChange }: RowProps) {
  return (
    <RowCard index={index + 1}>
      <div className="flex min-w-0 gap-2">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <Input
            value={data.date}
            onChange={(e) => onChange({ date: e.target.value })}
            placeholder="Fecha"
            className="text-xs"
          />
          <Input
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Título del evento"
            className="text-xs"
          />
        </div>

        <div className="w-20 shrink-0">
          <ImagePicker
            value={data.image.url}
            sourceUrl={data.image.sourceUrl}
            onChange={(file, url, source) =>
              onChange({ image: setSlotImage(data.image, file, url, source) })
            }
            crop={{ x: 1, y: 1 }}
            placeholder="Imagen"
          />
        </div>
      </div>
    </RowCard>
  );
}
