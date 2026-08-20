"use client";

import { useRef, useState } from "react";
import { Maximize, TriangleAlert, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GameType } from "./game";
import { useGameSession } from "./session";

interface GameTopbarProps {
  game: GameType;
  onFullscreen: () => void;
}

export function GameTopbar({ game, onFullscreen }: GameTopbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileName = useGameSession((s) => s.fileName);
  const [error, setError] = useState<string | null>(null);

  const Icon = game.meta.icon;

  async function handleFile(file: File) {
    setError(null);
    try {
      await game.load(file);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo leer el archivo.",
      );
    }
  }

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="font-heading text-sm font-semibold">
        {game.meta.name}
      </span>

      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
        {error ? (
          <span className="inline-flex items-center gap-1.5 text-destructive">
            <TriangleAlert className="size-3.5 shrink-0" />
            {error}
          </span>
        ) : (
          (fileName ?? "Sin datos cargados")
        )}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept=".json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <Upload />
        Cargar datos
      </Button>
      <Button size="sm" onClick={onFullscreen}>
        <Maximize />
        Pantalla completa
      </Button>
    </div>
  );
}
