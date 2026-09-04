"use client";

import { useRef, type ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { notifyInfo } from "../../notices/use-notices";

interface QuickImagesProps {
  onLoad: (files: File[]) => void;
  max?: number;
  label?: string;
  className?: string;
}

export function QuickImages({
  onLoad,
  max,
  label = "Cargar varias imágenes",
  className = "",
}: QuickImagesProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    if (max !== undefined && files.length > max) {
      notifyInfo(
        `Se eligieron ${files.length} imágenes; solo entran las primeras ${max}.`,
      );
    }
    onLoad(max === undefined ? files : files.slice(0, max));
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
