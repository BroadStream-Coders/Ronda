"use client";

import { Trash2 } from "lucide-react";

import { ImagePicker, RowCard } from "@/collector/kit";
import { Button } from "@/components/ui/button";

interface RowProps {
  index: number;
  imageUrl?: string;
  onImageChange: (file: File, url: string) => void;
  onRemove: () => void;
}

export function Row({ index, imageUrl, onImageChange, onRemove }: RowProps) {
  return (
    <RowCard
      index={index + 1}
      action={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Eliminar foto ${index + 1}`}
          className="h-8 w-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      }
    >
      <ImagePicker
        value={imageUrl}
        onChange={onImageChange}
        ratio={{ x: 16, y: 9 }}
        placeholder="Subir foto"
      />
    </RowCard>
  );
}
