"use client";

import { useState } from "react";
import { Dices } from "lucide-react";

import { Panel, PanelHint } from "@/collector/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <Panel
      title="Configuración"
      aside={
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">
          {logoCount} logos
        </span>
      }
      className="w-full shrink-0 lg:w-[260px]"
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-3">
        <div className="space-y-1.5">
          <Label htmlFor="board-size">Tamaño del tablero</Label>
          <Select
            value={boardSize}
            onValueChange={(val) => onSizeChange(val as BoardSize)}
          >
            <SelectTrigger id="board-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4x3">4 x 3 · 12 casillas</SelectItem>
              <SelectItem value="5x4">5 x 4 · 20 casillas</SelectItem>
              <SelectItem value="6x5">6 x 5 · 30 casillas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="random-count">Llenado aleatorio</Label>
          <div className="flex gap-2">
            <Input
              id="random-count"
              type="number"
              min="1"
              value={randomCount}
              onChange={(e) => setRandomCount(e.target.value)}
              className="h-9 w-16 shrink-0 text-center tabular-nums"
            />
            <Button
              variant="outline"
              onClick={handleRandomFill}
              className="h-9 flex-1 gap-2"
            >
              <Dices />
              Generar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Reparte esa cantidad de logos al azar en el tablero actual.
          </p>
        </div>
      </div>

      <PanelHint>
        Haz clic en una casilla del tablero para poner o quitar un logo a mano.
      </PanelHint>
    </Panel>
  );
}
