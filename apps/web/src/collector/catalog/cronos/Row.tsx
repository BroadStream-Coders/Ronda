"use client";

import { Trash2 } from "lucide-react";
import { ImagePicker, setSlotImage } from "@/collector/kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { RowData } from "./schema";

interface RowProps {
  index: number;
  data: RowData;
  onChange: (updates: Partial<RowData>) => void;
  onRemove: () => void;
}

export function Row({ index, data, onChange, onRemove }: RowProps) {
  return (
    <div className="group/row flex gap-3 rounded-lg border border-border/50 bg-muted/10 p-3 transition-colors hover:border-border/80">
      <div className="flex shrink-0 flex-col items-center justify-between">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {index + 1}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Eliminar evento"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 space-y-2">
        <Input
          value={data.date}
          onChange={(e) => onChange({ date: e.target.value })}
          placeholder="Fecha..."
          className="h-8 text-xs"
        />
        <Input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Título..."
          className="h-8 text-xs"
        />
        <ImagePicker
          value={data.image.url}
          onChange={(file, url) =>
            onChange({ image: setSlotImage(data.image, file, url) })
          }
          crop={{ x: 1, y: 1 }}
          placeholder="Subir imagen"
        />
      </div>
    </div>
  );
}
