"use client";

import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { PlayerData } from "./schema";

function PlayerSlot({
  index,
  data,
  onNameChange,
}: {
  index: number;
  data: PlayerData;
  onNameChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-background/40 transition-all hover:bg-background/60 hover:border-primary/30">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary border border-primary/20">
          <span className="text-[10px] font-bold">{index + 1}</span>
        </div>
        <span className="text-xs font-bold text-foreground">
          Jugador {index === 0 ? "Izquierda" : "Derecha"}
        </span>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <div className="w-full flex flex-col gap-1.5">
          <Label
            htmlFor={`player-name-${index}`}
            className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest text-center"
          >
            Nombre Equipo
          </Label>
          <Input
            id={`player-name-${index}`}
            type="text"
            value={data.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ej. Colegio..."
            className="h-9 rounded-lg bg-background border-border text-xs text-center placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-ring/30"
          />
        </div>
      </div>
    </div>
  );
}

export function Players({
  players,
  onPlayerNameChange,
}: {
  players: PlayerData[];
  onPlayerNameChange: (index: number, val: string) => void;
}) {
  return (
    <Card className="flex flex-col h-full w-[280px] shrink-0 rounded-xl border border-border bg-card shadow-none gap-0 py-0 overflow-hidden">
      <CardHeader className="flex flex-col items-center gap-2 border-b border-border px-4 py-4 shrink-0 bg-muted/20">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary ring-1 ring-primary/10">
          <Users className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold text-foreground tracking-tight text-center">
          Información de Jugadores
        </span>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
        <div className="space-y-4">
          {players.map((player, idx) => (
            <PlayerSlot
              key={idx}
              index={idx}
              data={player}
              onNameChange={(val) => onPlayerNameChange(idx, val)}
            />
          ))}
        </div>

        <div className="mt-auto p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-[10px] text-amber-500 font-medium leading-relaxed text-center">
            <span className="font-bold uppercase tracking-tight mr-1">Nota:</span>
            Diseñado para 2 equipos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
