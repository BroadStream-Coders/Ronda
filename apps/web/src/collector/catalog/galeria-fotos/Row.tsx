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
    <div className="group/row flex items-start gap-3 rounded-lg border border-border/50 bg-muted/10 p-3 transition-colors hover:border-border/80">
      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
        {index + 1}
      </div>

      <div className="flex-1">
        <ImagePicker
          value={imageUrl}
          onChange={onImageChange}
          placeholder="Subir imagen"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="mt-1 h-7 w-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover/row:opacity-100 sm:opacity-0 transition-all"
        title="Eliminar foto"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
