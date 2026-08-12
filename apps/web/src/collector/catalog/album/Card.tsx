"use client";

import { ImagePicker } from "@/collector/kit";

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
    <div
      className={`group grid w-full grid-cols-[2rem_minmax(0,1fr)_5rem] items-stretch gap-2 rounded-xl border p-2 transition-all duration-200 ${
        isCroma
          ? "border-primary bg-primary/10 ring-1 ring-primary shadow-xs"
          : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
      }`}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex h-8 w-full items-center justify-center rounded border border-border bg-muted/30 text-xs font-mono font-medium text-muted-foreground">
          {index}
        </div>
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
      </div>

      <textarea
        value={name || ""}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Pregunta..."
        className="h-full min-w-0 w-full resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:ring-1 focus:ring-primary/40 transition-all"
      />

      <div className="w-full">
        <ImagePicker value={imageUrl} onChange={onImageChange} placeholder="Foto" />
      </div>
    </div>
  );
}
