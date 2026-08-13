"use client";

import { Target, Trash2 } from "lucide-react";

import { ImagePicker } from "@/collector/kit";
import { Button } from "@/components/ui/button";

interface CardProps {
  name?: string;
  imageUrl?: string;
  isIntruso: boolean;
  crop: { x: number; y: number };
  onImageChange: (file: File, url: string) => void;
  onNameChange?: (name: string) => void;
  onToggleIntruso?: () => void;
  onRemove?: () => void;
}

export function Card({
  name,
  imageUrl,
  isIntruso,
  crop,
  onImageChange,
  onNameChange,
  onToggleIntruso,
  onRemove,
}: CardProps) {
  return (
    <div
      className={`group flex flex-col gap-2 rounded-xl border p-1.5 transition-all duration-200 ${
        isIntruso
          ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
      }`}
    >
      <div className="relative w-full">
        <ImagePicker
          value={imageUrl}
          onChange={onImageChange}
          crop={crop}
          placeholder="Foto"
        />

        {onToggleIntruso && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
            <Button
              size="sm"
              variant={isIntruso ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                if (!isIntruso) onToggleIntruso();
              }}
              className={`h-6 w-full gap-1 px-2 text-[9px] font-bold uppercase shadow-sm transition-all ${
                isIntruso
                  ? "bg-primary text-primary-foreground hover:brightness-110 border-transparent"
                  : "bg-background/95 text-muted-foreground hover:bg-primary/10 hover:text-primary border-border"
              }`}
            >
              {isIntruso && <Target className="h-3 w-3" />}
              {isIntruso ? "Es el intruso" : "Marcar intruso"}
            </Button>
          </div>
        )}

        {onRemove && (
          <div className="absolute top-2 right-2 flex opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
            <Button
              size="icon"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="h-6 w-6 bg-destructive/90 hover:bg-destructive shadow-sm"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {onNameChange && (
        <div className="px-0.5 pb-0.5">
          <input
            type="text"
            value={name || ""}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nombre..."
            onClick={(e) => e.stopPropagation()}
            className={`w-full h-8 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:ring-1 focus:ring-primary/40 transition-all ${
              isIntruso ? "border-primary/30" : ""
            }`}
          />
        </div>
      )}
    </div>
  );
}
