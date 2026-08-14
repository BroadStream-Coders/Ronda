"use client";

import Image from "next/image";
import { Plus, Crop, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useImagePicker } from "./use-image-picker";
import { ImageCropperDialog } from "./ImageCropperDialog";

interface ImagePickerProps {
  value?: string;
  onChange: (file: File, url: string) => void;
  crop?: { x: number; y: number };
  placeholder?: string;
  fill?: boolean;
  onClear?: () => void;
}

export function ImagePicker({
  value,
  onChange,
  crop,
  placeholder = "Foto",
  fill = false,
  onClear,
}: ImagePickerProps) {
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const isCropEnabled = !!crop;

  const {
    previewUrl,
    fileInputRef,
    triggerUpload,
    handleFileChange,
    setPreviewUrl,
    uncroppedUrl,
    uncroppedFile,
    commitCrop,
  } = useImagePicker({
    onImageSelect: onChange,
    initialPreview: value,
    skipCleanupOnUnmount: true,
    enableCrop: isCropEnabled,
    onCropTrigger: () => setIsCropperOpen(true),
  });

  const srcForCrop = uncroppedUrl || previewUrl;

  useEffect(() => {
    setPreviewUrl(value ?? null);
  }, [value, setPreviewUrl]);

  const shapeClass = crop ? "" : fill ? "h-full" : "aspect-square";

  return (
    <>
      <div
        className={`relative w-full ${shapeClass} overflow-hidden rounded-lg bg-muted/20 border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer group`}
        style={crop ? { aspectRatio: `${crop.x} / ${crop.y}` } : undefined}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest(".picker-action-btn")) return;
          triggerUpload();
        }}
      >
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="preview"
              fill
              unoptimized
              className={`transition-transform duration-300 group-hover:scale-105 ${
                crop ? "object-contain p-1" : "object-cover"
              }`}
            />
            {isCropEnabled && srcForCrop && (
              <div
                className="picker-action-btn absolute top-2 left-2 p-1.5 bg-black/60 rounded max-md:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCropperOpen(true);
                }}
              >
                <Crop className="w-4 h-4 text-white" />
              </div>
            )}
            {onClear && (
              <div
                className="picker-action-btn absolute top-2 right-2 p-1.5 bg-black/60 rounded max-md:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive z-10"
                title="Eliminar imagen"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                <Trash2 className="w-4 h-4 text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <span className="text-[9px] uppercase tracking-wider font-bold">
              {placeholder}
            </span>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {isCropEnabled && srcForCrop && (
        <ImageCropperDialog
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageSrc={srcForCrop}
          aspectRatio={(crop?.x || 1) / (crop?.y || 1)}
          fileType={uncroppedFile?.type || "image/jpeg"}
          onConfirm={(blob, url) => {
            const fileName = uncroppedFile?.name || "image.jpg";
            const ft = uncroppedFile?.type || "image/jpeg";
            const finalFile = new File([blob], fileName, { type: ft });
            commitCrop(finalFile, url);
            setIsCropperOpen(false);
          }}
        />
      )}
    </>
  );
}
