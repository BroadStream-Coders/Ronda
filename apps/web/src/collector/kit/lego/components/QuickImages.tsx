"use client";

import { useRef, type ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { centerCropFile } from "../../images/crop-image";
import { notifyInfo } from "../../notices/use-notices";

export interface QuickImage {
  file: File;
  url: string;
  sourceUrl?: string;
}

interface QuickImagesProps {
  onLoad: (images: QuickImage[]) => void;
  max?: number;
  crop?: { x: number; y: number };
  label?: string;
  className?: string;
}

export function QuickImages({
  onLoad,
  max,
  crop,
  label = "Cargar varias imágenes",
  className = "",
}: QuickImagesProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    if (max !== undefined && files.length > max) {
      notifyInfo(
        `Se eligieron ${files.length} imágenes; solo entran las primeras ${max}.`,
      );
    }

    const taken = max === undefined ? files : files.slice(0, max);
    if (!crop) {
      onLoad(
        taken.map((file) => ({ file, url: URL.createObjectURL(file) })),
      );
      return;
    }

    const aspect = crop.x / crop.y;
    const images: QuickImage[] = [];
    for (const file of taken) {
      const cropped = await centerCropFile(file, aspect);
      images.push({
        file: cropped,
        url: URL.createObjectURL(cropped),
        sourceUrl: URL.createObjectURL(file),
      });
    }
    onLoad(images);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        title={label}
        className={`h-9 min-w-0 justify-start gap-2 text-muted-foreground ${className}`}
      >
        <ImagePlus />
        <span className="truncate">{label}</span>
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
