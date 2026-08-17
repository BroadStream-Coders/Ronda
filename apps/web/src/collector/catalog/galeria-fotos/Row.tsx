"use client";

import { GroupRow, ImagePicker } from "@/collector/kit";

interface RowProps {
  index: number;
  imageUrl?: string;
  onImageChange: (file: File, url: string) => void;
  onRemove: () => void;
}

export function Row({ index, imageUrl, onImageChange, onRemove }: RowProps) {
  return (
    <GroupRow
      index={index}
      onRemove={onRemove}
      align="start"
      removeLabel="Eliminar foto"
    >
      <ImagePicker
        value={imageUrl}
        onChange={onImageChange}
        placeholder="Subir foto"
      />
    </GroupRow>
  );
}
