"use client";

import { useState } from "react";
import { Dices, Lightbulb } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BoardSize } from "./schema";

interface ControlsSidebarProps {
  boardSize: BoardSize;
  logoCount: number;
  onSizeChange: (size: BoardSize) => void;
  onRandomFill: (count: number) => void;
}

export function ControlsSidebar({
  boardSize,
  logoCount,
  onSizeChange,
  onRandomFill,
}: ControlsSidebarProps) {
  const [randomCount, setRandomCount] = useState("5");

  const handleRandomFill = () => {
    const count = parseInt(randomCount, 10);
    if (!isNaN(count) && count > 0) onRandomFill(count);
  };

  return (
    <section className="w-full lg:w-[280px] shrink-0 flex flex-col border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="flex-none bg-muted px-4 py-3 border-b border-border h-12 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Configuración</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Logos marcados
          </p>
          <div className="w-full h-10 text-sm bg-background border border-border rounded-md flex items-center justify-between px-3 font-medium">
            <span>Total de logos</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
              {logoCount}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Tamaño del tablero
          </p>
          <Select
            value={boardSize}
            onValueChange={(val) => onSizeChange(val as BoardSize)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4x3">4x3 (12 casillas)</SelectItem>
              <SelectItem value="5x4">5x4 (20 casillas)</SelectItem>
              <SelectItem value="6x5">6x5 (30 casillas)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label
            htmlFor="random-count"
            className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
          >
            Llenado aleatorio
          </label>
          <div className="flex gap-2">
            <input
              id="random-count"
              type="number"
              min="1"
              value={randomCount}
              onChange={(e) => setRandomCount(e.target.value)}
              className="w-16 h-10 flex-none rounded-md border border-border bg-background px-3 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={handleRandomFill}
              className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm transition-colors"
            >
              <Dices className="size-4" />
              Generar
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Coloca logos de forma aleatoria en el tablero actual.
          </p>
        </div>
      </div>

      <div className="p-4 bg-muted/30 border-t border-border mt-auto">
        <div className="text-sm text-muted-foreground flex flex-col gap-2 font-medium">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="size-4 text-primary" />
            <span className="font-bold text-foreground">Tip:</span>
          </div>
          <span className="leading-snug">
            Clic sobre una casilla del tablero para colocar o quitar un logo
            manualmente.
          </span>
        </div>
      </div>
    </section>
  );
}
