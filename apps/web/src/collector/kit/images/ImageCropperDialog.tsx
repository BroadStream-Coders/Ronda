"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import getCroppedImg from "./crop-image";

interface ImageCropperDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  aspectRatio: number;
  fileType?: string;
  onConfirm: (croppedBlob: Blob, croppedUrl: string) => void;
}

export function ImageCropperDialog({
  isOpen,
  onClose,
  imageSrc,
  aspectRatio,
  fileType = "image/jpeg",
  onConfirm,
}: ImageCropperDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, 0, fileType);
      const url = URL.createObjectURL(blob);
      onConfirm(blob, url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl p-0 overflow-hidden bg-background shadow-2xl"
      >
        <DialogHeader className="p-4 bg-muted/20 border-b border-border">
          <DialogTitle className="text-lg font-bold text-foreground">
            Ajustar imagen
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[400px] bg-black/90">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            classes={{ containerClassName: "rounded-sm" }}
          />
        </div>

        <div className="p-6 bg-muted/10 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)}
              className="py-2"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 shadow-lg"
            >
              {isProcessing ? "Recortando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
