"use client";

import { ImagePicker, RowCard } from "@/collector/kit";

interface CardProps {
  index: number;
  name?: string;
  imageUrl?: string;
  isCroma?: boolean;
  onImageChange: (file: File, url: string) => void;
  onNameChange: (name: string) => void;
  onToggleCroma: () => void;
}

export function Card({
  index,
  name,
  imageUrl,
  isCroma,
  onImageChange,
  onNameChange,
  onToggleCroma,
}: CardProps) {
  return (
    <RowCard
      index={index}
      selected={isCroma}
      action={
        <button
          onClick={onToggleCroma}
          title="Marcar como Croma"
          className={`flex w-full flex-1 items-center justify-center rounded border text-xs font-bold font-mono transition-colors ${
            isCroma
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50"
          }`}
        >
          C
        </button>
      }
    >
      <div className="flex min-w-0 gap-2">
        <textarea
          value={name || ""}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Pregunta..."
          className="h-full min-w-0 flex-1 resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:ring-1 focus:ring-primary/40 transition-all"
        />

        <div className="w-20 shrink-0">
          <ImagePicker value={imageUrl} onChange={onImageChange} placeholder="Foto" />
        </div>
      </div>
    </RowCard>
  );
}
