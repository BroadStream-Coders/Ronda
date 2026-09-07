"use client";

import { Trash2 } from "lucide-react";

import { ImagePicker, setSlotImage } from "@/collector/kit";
import { Button } from "@/components/ui/button";
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
    <div className="group grid w-full grid-cols-[2rem_minmax(0,1fr)_5rem] items-stretch gap-2 rounded-xl border border-border bg-card p-2 transition-all duration-200 hover:border-primary/40 hover:shadow-xs">
      <div className="flex flex-col gap-1.5">
        <div className="flex h-8 w-full items-center justify-center rounded border border-border bg-muted/30 text-xs font-mono font-medium text-muted-foreground">
          {index + 1}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Eliminar evento ${index + 1}`}
          className="w-full flex-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-1.5">
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

      <div className="w-full">
        <ImagePicker
          value={data.image.url}
          onChange={(file, url) =>
            onChange({ image: setSlotImage(data.image, file, url) })
          }
          crop={{ x: 1, y: 1 }}
          placeholder="Imagen"
        />
      </div>
    </div>
  );
}
