"use client";

import { Trash2 } from "lucide-react";

import { ImagePicker } from "@/collector/kit";
import { Button } from "@/components/ui/button";

interface RowProps {
  index: number;
  imageUrl?: string;
  onImageChange: (file: File, url: string) => void;
  onRemove: () => void;
}

export function Row({ index, imageUrl, onImageChange, onRemove }: RowProps) {
  return (
    <div className="group grid w-full grid-cols-[2rem_minmax(0,1fr)] items-stretch gap-2 rounded-xl border border-border bg-card p-2 transition-all duration-200 hover:border-primary/40 hover:shadow-xs">
      <div className="flex flex-col gap-1.5">
        <div className="flex h-8 w-full items-center justify-center rounded border border-border bg-muted/30 text-xs font-mono font-medium text-muted-foreground">
          {index + 1}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Eliminar foto ${index + 1}`}
          className="h-8 w-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

      <ImagePicker
        value={imageUrl}
        onChange={onImageChange}
        ratio={{ x: 16, y: 9 }}
        placeholder="Subir foto"
      />
    </div>
  );
}
